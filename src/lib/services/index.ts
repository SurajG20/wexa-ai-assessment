import { executeRead } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  BOM_EDGES,
  BOM_NODES,
  FACILITY_PICKER,
  GLOBAL_STATS,
  IMPACT_BY_FACILITY,
  MITIGATIONS_FOR_FACILITY,
  PRODUCT_CATALOGUE,
  PRODUCT_RISK_SUMMARY,
  REGION_EXPOSURE,
  REGION_FOOTPRINT,
  SINGLE_POINTS_OF_FAILURE,
} from "@/lib/cypher/queries";
import type {
  BomNode,
  CatalogRow,
  Chokepoint,
  FacilityOption,
  GlobalStats,
  ImpactSummary,
  ImpactRow,
  MitigationRow,
  ProductDetail,
  RegionExposureRow,
  RiskItem,
  SpofRow,
} from "./types";
import { list, num, optStr, str } from "./map";

/* ------------------------------------------------------------------ */
/* Impact simulation                                                   */
/* ------------------------------------------------------------------ */

export async function getFacilities(): Promise<FacilityOption[]> {
  return executeRead(async (tx) => {
    const res = await tx.run(FACILITY_PICKER);
    return res.records.map((r) => ({
      id: str(r, "id"),
      name: str(r, "name"),
      city: str(r, "city"),
      type: str(r, "type"),
      regionIso: str(r, "regionIso"),
      regionName: str(r, "regionName"),
      regionRiskIndex: num(r, "regionRiskIndex"),
      partsSourced: num(r, "partsSourced"),
    }));
  });
}

/** Run the blast-radius simulation for one facility and attach mitigations. */
export async function simulateImpact(facilityId: string): Promise<ImpactSummary> {
  const facilities = await getFacilities();
  const facility = facilities.find((f) => f.id === facilityId);
  if (!facility) throw new NotFoundError("Facility", facilityId);

  const impactedProducts = await executeRead(async (tx) => {
    const res = await tx.run(IMPACT_BY_FACILITY, { facilityId });
    return res.records.map((r): ImpactRow => {
      const chokepoints = list<Chokepoint>(r, "chokepoints");
      const unitPriceUsd = num(r, "unitPriceUsd");
      const annualUnits = num(r, "annualUnits");
      const worstShare = Math.max(0, ...chokepoints.map((c) => c.sharePct));
      return {
        sku: str(r, "sku"),
        name: str(r, "name"),
        brand: str(r, "brand"),
        category: str(r, "category"),
        unitPriceUsd,
        annualUnits,
        annualRevenueUsd: unitPriceUsd * annualUnits,
        disruptedRegion: str(r, "disruptedRegion"),
        singleSourceChokepoints: num(r, "singleSourceChokepoints"),
        chokepoints,
        exposureScore: Math.min(100, Math.round(worstShare)),
      };
    });
  });

  const mitigations = await getMitigations(facilityId);

  return {
    facility,
    impactedProducts,
    revenueAtRiskUsd: impactedProducts.reduce((acc, p) => acc + p.annualRevenueUsd, 0),
    mitigations,
  };
}

async function getMitigations(facilityId: string): Promise<MitigationRow[]> {
  return executeRead(async (tx) => {
    const res = await tx.run(MITIGATIONS_FOR_FACILITY, { facilityId });
    return res.records.map((r) => ({
      mpn: str(r, "mpn"),
      componentName: str(r, "componentName"),
      shareAtRisk: num(r, "shareAtRisk"),
      alternatives: list<{ component: string; supplier: string }>(r, "alternatives"),
    }));
  });
}

/* ------------------------------------------------------------------ */
/* Risk analytics                                                      */
/* ------------------------------------------------------------------ */

export function getSinglePointsOfFailure(limit = 10): Promise<SpofRow[]> {
  return executeRead(async (tx) => {
    const res = await tx.run(SINGLE_POINTS_OF_FAILURE, { limit });
    return res.records.map((r) => ({
      mpn: str(r, "mpn"),
      name: str(r, "name"),
      category: str(r, "category"),
      supplierName: str(r, "supplierName"),
      leadTimeDays: num(r, "leadTimeDays"),
      dependentProducts: num(r, "dependentProducts"),
      revenueExposedUsd: num(r, "revenueExposedUsd"),
    }));
  });
}

/** Merges the two region rollups (footprint × exposure) on `iso`. */
export async function getRegionExposure(): Promise<RegionExposureRow[]> {
  const [footprint, exposure] = await Promise.all([
    executeRead(async (tx) => {
      const res = await tx.run(REGION_FOOTPRINT);
      return res.records.map(
        (r): RegionExposureRow => ({
          iso: str(r, "iso"),
          name: str(r, "name"),
          continent: str(r, "continent"),
          riskIndex: num(r, "riskIndex"),
          facilities: num(r, "facilities"),
          suppliers: num(r, "suppliers"),
          partsSourced: num(r, "partsSourced"),
        }),
      );
    }),
    executeRead(async (tx) => {
      const res = await tx.run(REGION_EXPOSURE);
      return res.records.map((r) => ({
        iso: str(r, "iso"),
        productsAffected: num(r, "productsAffected"),
        revenueExposedUsd: num(r, "revenueExposedUsd"),
      }));
    }),
  ]);

  const byIso = new Map(exposure.map((e) => [e.iso, e]));
  return footprint
    .map((f) => ({ ...f, productsAffected: byIso.get(f.iso)?.productsAffected ?? 0, revenueExposedUsd: byIso.get(f.iso)?.revenueExposedUsd ?? 0 }))
    .sort((a, b) => (b.revenueExposedUsd ?? 0) - (a.revenueExposedUsd ?? 0));
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return executeRead(async (tx) => {
    const res = await tx.run(GLOBAL_STATS);
    const r = res.records[0];
    if (!r) throw new NotFoundError("Graph", "global stats — is the seed loaded?");
    return {
      products: num(r, "products"),
      components: num(r, "components"),
      suppliers: num(r, "suppliers"),
      facilities: num(r, "facilities"),
      regions: num(r, "regions"),
      singleSourcedComponents: num(r, "singleSourcedComponents"),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export function getCatalog(): Promise<CatalogRow[]> {
  return executeRead(async (tx) => {
    const res = await tx.run(PRODUCT_CATALOGUE);
    return res.records.map((r) => {
      const unitPriceUsd = num(r, "unitPriceUsd");
      const annualUnits = num(r, "annualUnits");
      return {
        sku: str(r, "sku"),
        name: str(r, "name"),
        brand: str(r, "brand"),
        category: str(r, "category"),
        unitPriceUsd,
        annualUnits,
        annualRevenueUsd: unitPriceUsd * annualUnits,
        totalParts: num(r, "totalParts"),
        singleSourceParts: num(r, "singleSourceParts"),
      };
    });
  });
}

export async function getProductDetail(sku: string): Promise<ProductDetail> {
  const catalogRows = await getCatalog();
  const catalog = catalogRows.find((p) => p.sku === sku);
  if (!catalog) throw new NotFoundError("Product", sku);

  const [nodes, edges, risks] = await Promise.all([
    executeRead(async (tx) => {
      const res = await tx.run(BOM_NODES, { sku });
      return res.records.map((r) => {
        const kindRaw = str(r, "kind");
        return {
          rootModuleId: str(r, "rootModuleId"),
          id: str(r, "id"),
          name: str(r, "name"),
          kind: (kindRaw === "Component" ? "Component" : "Module") as BomNode["kind"],
          mpn: optStr(r, "mpn"),
          sourceCount: r.get("sourceCount") === null ? null : num(r, "sourceCount"),
          sources: list<{ name: string; sharePct: number | null; leadTimeDays: number | null; unitCostUsd: number | null }>(r, "sources"),
          alternates: list<string>(r, "alternates"),
          children: [] as BomNode[],
        } satisfies BomNode;
      });
    }),
    executeRead(async (tx) => {
      const res = await tx.run(BOM_EDGES, { sku });
      return res.records.map((r) => ({ parent: str(r, "parentId"), child: str(r, "childId") }));
    }),
    getProductRisks(sku),
  ]);

  // Assemble the flat node/edge lists into nested trees (one per top module).
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const e of edges) byId.get(e.parent)?.children.push(byId.get(e.child)!);
  const roots = nodes.filter((n) => !edges.some((e) => e.child === n.id));

  return { catalog, bom: roots.sort((a, b) => a.name.localeCompare(b.name)), risks };
}

async function getProductRisks(sku: string): Promise<RiskItem[]> {
  return executeRead(async (tx) => {
    const res = await tx.run(PRODUCT_RISK_SUMMARY, { sku });
    return res.records.map((r) => ({
      mpn: str(r, "mpn"),
      name: str(r, "name"),
      supplierName: str(r, "supplierName"),
      sharePct: num(r, "sharePct"),
      leadTimeDays: num(r, "leadTimeDays"),
      sites: list<{ site: string; region: string; iso: string }>(r, "sites"),
    }));
  });
}
