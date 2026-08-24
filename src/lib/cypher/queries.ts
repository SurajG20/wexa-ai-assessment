/**
 * Every Cypher statement used by the application.
 *
 * Conventions
 * -----------
 * - Queries only ever receive values through parameters ($param) — never via
 *   string interpolation.
 * - Multi-hop traversals use variable-length paths (`*1..`) across the BOM;
 *   these are the queries that would require recursive CTEs in SQL.
 * - Aggregations deduplicate exploded paths with `WITH DISTINCT` before
 *   summing, so multi-path BOM routes never double-count.
 */

/* ------------------------------------------------------------------ */
/* Impact simulation                                                   */
/* ------------------------------------------------------------------ */

/**
 * THE flagship query — "what dies if this facility goes offline?"
 *
 * Traverses facility ← supplier ← part ← variable-length BOM ← product
 * (5+ hops). Grouped per product so the UI can rank by revenue at risk.
 */
export const IMPACT_BY_FACILITY = `
MATCH (f:Facility {id: $facilityId})-[:LOCATED_IN]->(region:Region)
MATCH (f)<-[:OPERATES]-(supplier:Supplier)
MATCH (supplier)<-[sup:SUPPLIED_BY]-(part)
MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(part)
WITH DISTINCT product, supplier, sup, part, region
WITH product, region,
     collect(DISTINCT {
       part: part.name,
       category: coalesce(part.category, 'assembly'),
       supplier: supplier.name,
       sharePct: sup.share_pct,
       leadTimeDays: sup.lead_time_days,
       singleSource: sup.share_pct >= 99
     }) AS chokepoints
RETURN product.sku AS sku,
       product.name AS name,
       product.brand AS brand,
       product.category AS category,
       product.unit_price_usd AS unitPriceUsd,
       product.annual_units AS annualUnits,
       region.name AS disruptedRegion,
       size([cp IN chokepoints WHERE cp.singleSource]) AS singleSourceChokepoints,
       chokepoints
ORDER BY product.unit_price_usd * product.annual_units DESC
`;

/**
 * Mitigation finder: for parts flowing through the disrupted facility, find
 * qualified alternate components whose entire supply base sits OUTSIDE the
 * impacted region (pattern-comprehension + ALL predicate).
 */
export const MITIGATIONS_FOR_FACILITY = `
MATCH (f:Facility {id: $facilityId})-[:LOCATED_IN]->(impacted:Region)
MATCH (f)<-[:OPERATES]-(:Supplier)<-[sup:SUPPLIED_BY]-(part:Component)
WHERE sup.share_pct >= 20
MATCH (part)-[:ALT_SOURCE]->(alt:Component)-[altSup:SUPPLIED_BY]->(altSupplier:Supplier)
WITH part, sup, impacted, alt, altSupplier,
     [(altSupplier)-[:OPERATES]->(:Facility)-[:LOCATED_IN]->(ar:Region) | ar.iso] AS altRegions
WHERE ALL(iso IN altRegions WHERE iso <> impacted.iso)
RETURN part.mpn AS mpn,
       part.name AS componentName,
       sup.share_pct AS shareAtRisk,
       collect(DISTINCT {component: alt.name, supplier: altSupplier.name})[..3] AS alternatives
ORDER BY shareAtRisk DESC
LIMIT 12
`;

/* ------------------------------------------------------------------ */
/* Risk analytics                                                      */
/* ------------------------------------------------------------------ */

/**
 * Single points of failure: leaf components sourced from exactly one
 * supplier, ranked by annual revenue exposed through them. Requires the
 * `sourceCount` property maintained by the seed loader.
 */
export const SINGLE_POINTS_OF_FAILURE = `
MATCH (c:Component {sourceCount: 1})-[sup:SUPPLIED_BY]->(supplier:Supplier)
MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(c)
WITH DISTINCT c, sup, supplier, product
WITH c, sup, supplier, collect(product) AS products
RETURN c.mpn AS mpn,
       c.name AS name,
       c.category AS category,
       supplier.name AS supplierName,
       sup.lead_time_days AS leadTimeDays,
       size(products) AS dependentProducts,
       reduce(rev = 0.0, p IN products | rev + p.unit_price_usd * p.annual_units) AS revenueExposedUsd
ORDER BY revenueExposedUsd DESC
LIMIT $limit
`;

/** Region rollup part 1 — structural footprint. */
export const REGION_FOOTPRINT = `
MATCH (r:Region)
OPTIONAL MATCH (r)<-[:LOCATED_IN]-(f:Facility)
OPTIONAL MATCH (f)<-[:OPERATES]-(s:Supplier)
OPTIONAL MATCH (s)<-[:SUPPLIED_BY]-(part)
WITH r, count(DISTINCT f) AS facilities, count(DISTINCT s) AS suppliers,
     count(DISTINCT part) AS partsSourced
RETURN r.iso AS iso, r.name AS name, r.continent AS continent,
       r.riskIndex AS riskIndex, facilities, suppliers, partsSourced
ORDER BY partsSourced DESC
`;

/**
 * Region rollup part 2 — downstream revenue exposure through the BOM.
 * Splitting footprint and exposure into two simple statements keeps both
 * aggregations readable while the service layer joins them on `iso`.
 */
export const REGION_EXPOSURE = `
MATCH (r:Region)<-[:LOCATED_IN]-(:Facility)<-[:OPERATES]-(:Supplier)<-[:SUPPLIED_BY]-(part)
MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(part)
WITH DISTINCT r, product
RETURN r.iso AS iso,
       count(product) AS productsAffected,
       sum(product.unit_price_usd * product.annual_units) AS revenueExposedUsd
`;

/** Global counters for the dashboard hero row. */
export const GLOBAL_STATS = `
MATCH (p:Product)      WITH count(p) AS products
MATCH (c:Component)    WITH products, count(c) AS components
MATCH (s:Supplier)     WITH products, components, count(s) AS suppliers
MATCH (f:Facility)     WITH products, components, suppliers, count(f) AS facilities
MATCH (r:Region)       WITH products, components, suppliers, facilities, count(r) AS regions
MATCH (ss:Component {sourceCount: 1}) WITH products, components, suppliers, facilities, regions, count(ss) AS singleSourcedComponents
RETURN products, components, suppliers, facilities, regions, singleSourcedComponents
`;

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

/** Product catalogue with per-BOM risk counters (deduped before counting). */
export const PRODUCT_CATALOGUE = `
MATCH (p:Product)
MATCH (p)-[:HAS_MODULE|CONTAINS*1..]->(c:Component)
WITH DISTINCT p, c
WITH p,
     count(c) AS totalParts,
     sum(CASE WHEN c.sourceCount = 1 THEN 1 ELSE 0 END) AS singleSourceParts
RETURN p.sku AS sku, p.name AS name, p.brand AS brand, p.category AS category,
       p.unit_price_usd AS unitPriceUsd, p.annual_units AS annualUnits,
       totalParts, singleSourceParts
ORDER BY p.unit_price_usd * p.annual_units DESC
`;

/** BOM tree — node pass: every module/component reachable from the product. */
export const BOM_NODES = `
MATCH (p:Product {sku: $sku})-[:HAS_MODULE]->(root:Module)
MATCH (root)-[:CONTAINS*0..]->(node)
WITH DISTINCT root, node
RETURN root.id AS rootModuleId,
       node.id AS id,
       node.name AS name,
       labels(node)[0] AS kind,
       coalesce(node.mpn, null) AS mpn,
       node.sourceCount AS sourceCount,
       [(node)-[s:SUPPLIED_BY]->(sup:Supplier) |
         {name: sup.name, sharePct: s.share_pct, leadTimeDays: s.lead_time_days, unitCostUsd: s.unit_cost_usd}
       ] AS sources,
       [(node)-[:ALT_SOURCE]->(a:Component) | a.name] AS alternates
ORDER BY rootModuleId, kind DESC, name
`;

/** BOM tree — edge pass: parent links for every non-root node. */
export const BOM_EDGES = `
MATCH (:Product {sku: $sku})-[:HAS_MODULE]->(:Module)-[:CONTAINS*1..]->(child)
MATCH (parent:Module)-[:CONTAINS]->(child)
RETURN DISTINCT parent.id AS parentId, child.id AS childId
`;

/** Top supply-chain chokepoints for one product (detail page right rail). */
export const PRODUCT_RISK_SUMMARY = `
MATCH (p:Product {sku: $sku})-[:HAS_MODULE|CONTAINS*1..]->(c:Component)-[sup:SUPPLIED_BY]->(supplier:Supplier)
WITH DISTINCT c, sup, supplier
WITH c, sup, supplier,
     [(supplier)-[:OPERATES]->(f:Facility)-[:LOCATED_IN]->(r:Region) | {site: f.city, region: r.name, iso: r.iso}] AS sites
RETURN c.mpn AS mpn, c.name AS name, supplier.name AS supplierName,
       sup.share_pct AS sharePct, sup.lead_time_days AS leadTimeDays, sites[..3] AS sites
ORDER BY sup.share_pct DESC, sup.lead_time_days DESC
LIMIT 8
`;

/* ------------------------------------------------------------------ */
/* Pickers                                                             */
/* ------------------------------------------------------------------ */

/** Facilities available in the impact simulator, richest targets first. */
export const FACILITY_PICKER = `
MATCH (f:Facility)-[:LOCATED_IN]->(r:Region)
OPTIONAL MATCH (f)<-[:OPERATES]-(s:Supplier)<-[:SUPPLIED_BY]-(part)
WITH DISTINCT f, r, part
WITH f, r, count(part) AS partsSourced
RETURN f.id AS id, f.name AS name, f.city AS city, f.type AS type,
       r.iso AS regionIso, r.name AS regionName, r.riskIndex AS regionRiskIndex,
       partsSourced
ORDER BY r.riskIndex DESC, partsSourced DESC
`;
