/**
 * Deterministic seed loader for the SiliconTrace graph.
 *
 * Usage:
 *   npm run seed              # upsert the full dataset (safe to re-run)
 *   npm run seed -- --reset   # wipe all data first
 *
 * The script is idempotent: uniqueness constraints back MERGE statements,
 * so replaying never duplicates nodes or relationships.
 */
import type { Driver } from "neo4j-driver";
import { getDriver, closeDriver } from "../src/lib/db";
import { CONSTRAINTS, constraintCypher } from "../src/lib/cypher/schema";
import { SUPPLIERS, REGIONS } from "./seed/dataset-org";
import { COMPONENTS, MODULE_SOURCES, PRODUCTS, type BuildNode } from "./seed/dataset-parts";

const BATCH_SIZE = 400;

/** Map facility cities to regions (kept explicit — no fuzzy geography). */
const CITY_REGION: Record<string, string> = {
  Tainan: "TW", Taichung: "TW", Hsinchu: "TW", Miaoli: "TW", Kaohsiung: "TW", "New Taipei": "TW",
  Taipei: "TW", Taoyuan: "TW", Guishan: "TW", Phoenix: "US", Taylor: "US", Boise: "US", Chandler: "US",
  Hillsboro: "US", Malta: "US", Dallas: "US", Lehi: "US", Austin: "US", "Newbury Park": "US",
  Greensboro: "US", Richardson: "US", "San Diego": "US", "Fort Collins": "US", "Santa Clara": "US",
  Houston: "US", "St. Petersburg": "US", Lisle: "US", Hwaseong: "KR", Pyeongtaek: "KR", Icheon: "KR",
  Cheongju: "KR", Ochang: "KR", Asan: "KR", Cheonan: "KR", Paju: "KR", Busan: "KR", Gumi: "KR",
  Wuxi: "CN", Shanghai: "CN", Beijing: "CN", Shenzhen: "CN", Guangzhou: "CN", Chengdu: "CN",
  Heyuan: "CN", Tianjin: "CN", Ningde: "CN", Dongguan: "CN", Nanjing: "CN", Zhuhai: "CN",
  Kunshan: "CN", Jiangyin: "CN", Yantai: "CN", Changzhou: "CN", Weifang: "CN", Suzhou: "CN",
  Dalian: "CN", Huangshi: "CN", Hiroshima: "JP", Hitachinaka: "JP", Kofu: "JP", Fukui: "JP",
  Narita: "JP", Kagoshima: "JP", Kirishima: "JP", Yokohama: "JP", Gifu: "JP", Onomichi: "JP",
  Osaka: "JP", Isahaya: "JP", Kaminoyama: "JP", Singapore: "SG", Woodlands: "SG", Dresden: "DE",
  Villach: "AT", Kulim: "MY", Melaka: "MY", Penang: "MY", BayanLepas: "MY", Manila: "PH",
  Laguna: "PH", Eindhoven: "NL", "Migdal HaEmek": "IL", Mexicali: "MX", Pardubice: "CZ",
  Wroclaw: "PL", Leixlip: "IE", Chennai: "IN", Hanoi: "VN", "Bac Ninh": "VN", Newport: "GB",
  Bordeaux: "FR", Arnstadt: "DE", Erlangen: "DE", "Queen Creek": "US", "De Soto": "US",
};

function regionFor(city: string): string {
  const iso = CITY_REGION[city];
  if (!iso) throw new Error(`No region mapping for facility city "${city}" — add it to scripts/seed.ts`);
  return iso;
}

/* ------------------------------------------------------------------ */
/* Row builders                                                        */
/* ------------------------------------------------------------------ */

type RowMap = Record<string, Record<string, unknown>[]>;

function buildRows(): RowMap {
  const rows: RowMap = {
    region: [],
    supplier: [],
    facility: [],
    component: [],
    suppliedBy: [],
    altSource: [],
    product: [],
    module: [],
    hasModule: [],
    containsModule: [],
    containsComponent: [],
    moduleSuppliedBy: [],
  };

  rows.region = REGIONS.map((r) => ({ ...r }));
  rows.supplier = SUPPLIERS.map((s) => ({ id: s.id, name: s.name, hq: s.hq }));
  for (const s of SUPPLIERS) {
    for (const fac of s.facilities) {
      rows.facility.push({ ...fac, region: regionFor(fac.city), supplier: s.id });
    }
  }

  for (const c of COMPONENTS) {
    rows.component.push({ mpn: c.mpn, name: c.name, category: c.category });
    for (const src of c.sources) {
      rows.suppliedBy.push({
        mpn: c.mpn,
        supplier: src.supplier,
        sharePct: src.share,
        leadDays: src.leadDays,
        unitCost: src.unitCost,
      });
    }
    for (const alt of c.alts ?? []) {
      // Store each pair once (lexicographic) so replays never duplicate edges.
      if (c.mpn < alt) rows.altSource.push({ from: c.mpn, to: alt });
    }
  }

  for (const p of PRODUCTS) {
    rows.product.push({
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      unitPriceUsd: p.unitPriceUsd,
      annualUnits: p.annualUnits,
    });
    for (const root of p.tree) walk(p.sku, root, null);
  }

  function walk(sku: string, node: BuildNode, parentId: string | null): void {
    const moduleId = `${sku}:${node.id}`;
    rows.module.push({ id: moduleId, name: node.name });

    if (parentId) rows.containsModule.push({ parent: parentId, child: moduleId });
    else rows.hasModule.push({ sku, moduleId });

    if (node.assembly) {
      const spec = MODULE_SOURCES[node.assembly];
      if (!spec) throw new Error(`Product ${sku}: unknown assembly key "${node.assembly}"`);
      const [supplier, leadDays, unitCost] = spec;
      rows.moduleSuppliedBy.push({ moduleId, supplier, leadDays, unitCost });
    }
    for (const mpn of node.comps ?? []) {
      if (!COMPONENTS.some((c) => c.mpn === mpn)) {
        throw new Error(`Product ${sku}: unknown component "${mpn}" referenced in module "${node.name}"`);
      }
      rows.containsComponent.push({ moduleId, mpn });
    }
    for (const child of node.children ?? []) walk(sku, child, moduleId);
  }

  return rows;
}

/* ------------------------------------------------------------------ */
/* Load statements                                                     */
/* ------------------------------------------------------------------ */

const STATEMENTS: [key: keyof RowMap, cypher: string][] = [
  [
    "region",
    "UNWIND $rows AS r MERGE (n:Region {iso: r.iso}) SET n.name = r.name, n.continent = r.continent, n.riskIndex = r.riskIndex",
  ],
  ["supplier", "UNWIND $rows AS s MERGE (n:Supplier {id: s.id}) SET n.name = s.name, n.hq = s.hq"],
  [
    "facility",
    `UNWIND $rows AS f
     MATCH (sup:Supplier {id: f.supplier})
     MATCH (reg:Region {iso: f.region})
     MERGE (n:Facility {id: f.id})
     SET n.name = f.name, n.city = f.city, n.type = f.type
     MERGE (sup)-[:OPERATES]->(n)
     MERGE (n)-[:LOCATED_IN]->(reg)`,
  ],
  ["component", "UNWIND $rows AS c MERGE (n:Component {mpn: c.mpn}) SET n.name = c.name, n.category = c.category"],
  [
    "suppliedBy",
    `UNWIND $rows AS s
     MATCH (comp:Component {mpn: s.mpn})
     MATCH (sup:Supplier {id: s.supplier})
     MERGE (comp)-[r:SUPPLIED_BY]->(sup)
     SET r.share_pct = s.sharePct, r.lead_time_days = s.leadDays, r.unit_cost_usd = s.unitCost`,
  ],
  [
    "altSource",
    `UNWIND $rows AS a
     MATCH (x:Component {mpn: a.from})
     MATCH (y:Component {mpn: a.to})
     MERGE (x)-[:ALT_SOURCE]->(y)
     MERGE (y)-[:ALT_SOURCE]->(x)`,
  ],
  [
    "product",
    `UNWIND $rows AS p
     MERGE (n:Product {sku: p.sku})
     SET n.name = p.name, n.brand = p.brand, n.category = p.category,
         n.unit_price_usd = p.unitPriceUsd, n.annual_units = p.annualUnits`,
  ],
  ["module", "UNWIND $rows AS m MERGE (n:Module {id: m.id}) SET n.name = m.name"],
  [
    "hasModule",
    `UNWIND $rows AS h
     MATCH (p:Product {sku: h.sku})
     MATCH (m:Module {id: h.moduleId})
     MERGE (p)-[:HAS_MODULE]->(m)`,
  ],
  [
    "containsModule",
    `UNWIND $rows AS c
     MATCH (parent:Module {id: c.parent})
     MATCH (child:Module {id: c.child})
     MERGE (parent)-[:CONTAINS]->(child)`,
  ],
  [
    "containsComponent",
    `UNWIND $rows AS c
     MATCH (m:Module {id: c.moduleId})
     MATCH (comp:Component {mpn: c.mpn})
     MERGE (m)-[:CONTAINS]->(comp)`,
  ],
  [
    "moduleSuppliedBy",
    `UNWIND $rows AS s
     MATCH (m:Module {id: s.moduleId})
     MATCH (sup:Supplier {id: s.supplier})
     MERGE (m)-[r:SUPPLIED_BY]->(sup)
     SET r.lead_time_days = s.leadDays, r.unit_cost_usd = s.unitCost, r.share_pct = 100`,
  ],
];

async function runBatched(driver: Driver, cypher: string, batchRows: Record<string, unknown>[]) {
  for (let i = 0; i < batchRows.length; i += BATCH_SIZE) {
    const chunk = batchRows.slice(i, i + BATCH_SIZE);
    const session = driver.session({ defaultAccessMode: "WRITE" });
    try {
      await session.executeWrite((tx) => tx.run(cypher, { rows: chunk }));
    } finally {
      await session.close();
    }
  }
}

async function main() {
  const reset = process.argv.includes("--reset");
  console.log("→ SiliconTrace seed");

  try {
    process.loadEnvFile(".env");
  } catch {
    console.warn("⚠ No .env file found — relying on ambient environment variables.");
  }

  const driver = await getDriver();
  const info = await driver.getServerInfo();
  console.log(`✓ Connected to ${info.agent}`);

  {
    const session = driver.session({ defaultAccessMode: "WRITE" });
    try {
      for (const c of CONSTRAINTS) await session.executeWrite((tx) => tx.run(constraintCypher(c)));
    } finally {
      await session.close();
    }
  }
  console.log(`✓ Ensured ${CONSTRAINTS.length} uniqueness constraints`);

  if (reset) {
    const session = driver.session({ defaultAccessMode: "WRITE" });
    try {
      await session.executeWrite((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    } finally {
      await session.close();
    }
    console.log("✓ Existing graph cleared (--reset)");
  }

  const rows = buildRows();
  for (const [key, cypher] of STATEMENTS) {
    await runBatched(driver, cypher, rows[key]);
    console.log(`  · ${String(key).padEnd(18)} ${rows[key].length} rows`);
  }

  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const res = await session.executeRead((tx) =>
      tx.run(`
        MATCH (n)
        WITH count(n) AS nodes
        OPTIONAL MATCH ()-[r]->()
        RETURN nodes, count(r) AS rels
      `),
    );
    const summary = res.records[0]?.toObject() as { nodes: number; rels: number };
    console.log(`\n✓ Graph now holds ${summary.nodes} nodes and ${summary.rels} relationships.`);
  } finally {
    await session.close();
  }
}

main()
  .then(() => closeDriver())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✗ Seed failed:", error instanceof Error ? error.message : error);
    void closeDriver().then(() => process.exit(1));
  });
