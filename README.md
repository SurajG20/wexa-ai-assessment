# SiliconTrace

**Semiconductor supply-chain risk explorer — powered by CognoDB.**

Take a fab offline and watch the failure propagate: SiliconTrace traverses the
global chip supply chain as a graph — facility → supplier → part → bill of
materials → product — to rank finished products by revenue at risk, surface
single points of failure, and recommend dual-sourcing mitigations.

🔗 **Live demo**: https://wexa-ai-drab.vercel.app

| Dashboard | Impact simulator | BOM explorer |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Impact](docs/screenshots/impact.png) | ![BOM](docs/screenshots/bom.png) |

---

## The use case

Modern electronics depend on a deeply layered manufacturing network: a single
smartphone contains hundreds of components, many of them made by one of a
handful of fabs concentrated in one geographic region. When an earthquake,
export restriction or pandemic shuts down one facility, the interesting
question is not "which supplier is down?" but:

- **Which finished products die?**
- **How much revenue is exposed, per product and per region?**
- **Which parts are unrecoverable** because their entire supply base sits in
  the impacted region?
- **Where should we qualify alternate sources *before* the disruption?**

SiliconTrace answers all four from one graph with multi-hop Cypher
traversals.

## Why a graph database?

The core object here is a **bill of materials** — a recursive hierarchy where
products contain modules that contain sub-modules that contain components,
and any node in that tree can be sourced from multiple suppliers operating
multiple facilities across regions.

In SQL this becomes a painful exercise:

- **Variable-depth recursion.** BOMs are trees of arbitrary depth. Relational
  queries need recursive CTEs (`WITH RECURSIVE`) for every rollup, which are
  hard to write, easy to get subtly wrong (missing `DISTINCT` → double-counted
  revenue), and expensive when parts are shared across many products.
- **Multi-path fan-out.** One component feeds dozens of products through
  dozens of distinct BOM routes. Aggregating "revenue at risk" means walking
  every path and deduplicating — exactly what Cypher's variable-length paths
  + `WITH DISTINCT` express directly:
  ```cypher
  MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(part)
  ```
- **Relationship-first questions.** "Alternate sources whose entire supply
  base sits outside the impacted region" is a query about the *shape* of the
  neighbourhood around a part. In Cypher it is one pattern-comprehension plus
  an `ALL` predicate; in SQL it is nested `NOT EXISTS` subqueries over two
  join levels.
- **Schema evolution.** Adding "purchased assemblies" (modules bought whole
  rather than manufactured) was a zero-migration change: new edges, same
  traversal.

A relational schema can store this data fine — but every *question the app
exists to ask* is a traversal. That is the case for a graph database.

## Data model

```
                        ┌────────────┐
                        │   Region   │  iso, name, continent, riskIndex
                        └────────────┘
                             ▲    ▲ ALL(iso <> impacted)  ← mitigation filter
                   LOCATED_IN│    │LOCATED_IN
                             │    ▼
┌────────────┐  OPERATES ┌───┴─────────┐ SUPPLIED_BY ┌─────────────┐ ALT_SOURCE
│  Supplier  ├──────────►│  Facility   │◄────────────┤  Component  ├──────────┐
│ name,hq    │           │ city,type   │ share_pct,  │ mpn,name,   │          │
└────────────┘           └─────────────┘ lead_time,  │ category,   │          │
      ▲                                   unit_cost   │ sourceCount │   qualified
      │ SUPPLIED_BY (purchased            ┌───────────►└─────────────┘   alternates
      │              assemblies)          │        ▲ CONTAINS*
┌─────┴──────┐                     ┌──────┴─────┐  ┌────────────┐
│   Module   │                     │  Product   │  │   Module   │ …variable depth
│ name       │                     │ sku,name,  ├──┤ sub-module │
└────────────┘                     │ brand,     │  └────────────┘
      ▲ HAS_MODULE                 │ price,     │
      └────────────────────────────┤ units/yr   │
                                   └────────────┘
```

- **Nodes**: `Region`, `Supplier`, `Facility`, `Component`, `Module`, `Product`
  — 515 nodes seeded.
- **Typed relationships**: `LOCATED_IN`, `OPERATES`, `SUPPLIED_BY` (with
  `share_pct`, `lead_time_days`, `unit_cost_usd` properties), `ALT_SOURCE`
  (symmetric, qualified alternates), `HAS_MODULE`, `CONTAINS` (recursive BOM).
- **Denormalised helper**: `sourceCount` on `Component` is backfilled by the
  seeder so single-source-of-failure lookups don't aggregate at read time.
- Uniqueness constraints back every `MERGE`, making the seed idempotent.

Seed dataset (deterministic, no RNG at runtime): 60 suppliers, 141 facilities,
89 shared components, 169 modules, 30 products across TW/KR/CN/JP/US/EU —
999 relationships total.

## Setup

### 1. Create a CognoDB instance

1. Sign up at [console.cognodb.com/signup](https://console.cognodb.com/signup)
   (free tier, no credit card).
2. Create a free **c0** instance in any region.
3. Copy the connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`)
   and the generated password for user `cognodb` — the password is shown once.

### 2. Configure & run

```bash
git clone https://github.com/SurajG20/wexa-ai-assessment.git
cd wexa-ai-assessment
npm install

cp .env.example .env         # fill in your COGNODB_URI / COGNODB_PASSWORD
npm run seed                 # loads constraints + full dataset (idempotent)
npm run dev                  # http://localhost:3000
```

Environment variables (never committed):

| Variable | Example |
| --- | --- |
| `COGNODB_URI` | `bolt+s://xxxx.databases.cognodb.cloud` |
| `COGNODB_USER` | `cognodb` |
| `COGNODB_PASSWORD` | *(generated password)* |

### 3. Deploy (optional)

Any Node host works. This repo ships a `vercel.json`; set the three env vars
in your host's dashboard and deploy.

## Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # dashboard: stats, region exposure, SPOF ranking
│   ├── impact/             # blast-radius simulator
│   ├── products/[sku]/     # catalogue + interactive BOM tree
│   └── api/                # health · impact · products · spof
├── components/             # UI primitives (shadcn/radix) + app widgets
├── lib/
│   ├── config.ts           # zod-validated env, parsed once
│   ├── db.ts               # neo4j-driver singleton (pool sizing, retries)
│   ├── errors.ts           # domain errors → classified, actionable messages
│   ├── cypher/
│   │   ├── schema.ts       # uniqueness constraints
│   │   └── queries.ts      # every Cypher statement, parameterised
│   └── services/           # domain layer: records → typed models
scripts/
├── seed.ts                 # deterministic loader (MERGE-backed, re-runnable)
└── seed/dataset-*.ts       # realistic supply-chain data
```

Every DB access goes through `executeRead/executeWrite` managed transactions.
All queries take parameters — there is no string interpolation anywhere.
Failures are classified (config / auth / unavailable / unknown) into HTTP
responses and friendly UI states; `/api/health` reports connectivity and
latency.

## Main queries explained

All statements live in [`src/lib/cypher/queries.ts`](src/lib/cypher/queries.ts).

### 1. Blast radius — *"what dies if this fab goes offline?"*

```cypher
MATCH (f:Facility {id: $facilityId})-[:LOCATED_IN]->(region:Region)
MATCH (f)<-[:OPERATES]-(supplier:Supplier)
MATCH (supplier)<-[sup:SUPPLIED_BY]-(part)
MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(part)
WITH DISTINCT product, ...
```

**6 hops**: facility → region, facility ← supplier ← part, then a
*variable-depth BOM traversal* up to the affected products. `WITH DISTINCT`
deduplicates exploded paths so shared parts never double-count revenue. A
relational version needs recursive CTEs plus careful dedup — this is the
query SQL finds awkward.

### 2. Mitigation finder — alternate sources outside the blast zone

```cypher
MATCH (part)-[:ALT_SOURCE]->(alt)-[altSup:SUPPLIED_BY]->(altSupplier)
WITH part, sup, impacted, alt, altSupplier,
     [(altSupplier)-[:OPERATES]->(:Facility)-[:LOCATED_IN]->(ar:Region) | ar.iso] AS altRegions
WHERE ALL(iso IN altRegions WHERE iso <> impacted.iso)
```

For each at-risk part, collect the ISO codes of every facility its alternate
suppliers operate and keep only parts whose **entire** alternate base sits
outside the impacted region — pattern comprehension + universal quantifier,
one readable statement.

### 3. Single points of failure

```cypher
MATCH (c:Component {sourceCount: 1})-[sup:SUPPLIED_BY]->(supplier)
MATCH (product:Product)-[:HAS_MODULE|CONTAINS*1..]->(c)
RETURN c.mpn, ..., size(products), reduce(rev = 0.0, p IN products | ...)
```

Parts sourced from exactly one supplier, ranked by annual revenue exposed
across all dependent products — again via recursive traversal + aggregation.

Also included: per-region exposure rollups, per-product chokepoint summaries,
and a BOM tree reader (`CONTAINS*0..`) that renders interactive product trees.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 +
shadcn/ui · Recharts · `neo4j-driver` (Bolt) against **CognoDB** · tsx seeder.

## Video walkthrough

📹 [Screen recording](docs/walkthrough.mp4) — dashboard → simulation → BOM drill-down.
