/** DTOs returned by the service layer — the contract between graph and UI. */

export type Chokepoint = {
  part: string;
  category: string;
  supplier: string;
  sharePct: number;
  leadTimeDays: number;
  singleSource: boolean;
};

export type ImpactRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unitPriceUsd: number;
  annualUnits: number;
  annualRevenueUsd: number;
  disruptedRegion: string;
  singleSourceChokepoints: number;
  chokepoints: Chokepoint[];
  /** Rough 0–100 exposure score: max share lost across chokepoints, pinned at 100 when single-sourced. */
  exposureScore: number;
};

export type ImpactSummary = {
  facility: FacilityOption;
  impactedProducts: ImpactRow[];
  revenueAtRiskUsd: number;
  mitigations: MitigationRow[];
};

export type MitigationRow = {
  mpn: string;
  componentName: string;
  shareAtRisk: number;
  alternatives: { component: string; supplier: string }[];
};

export type SpofRow = {
  mpn: string;
  name: string;
  category: string;
  supplierName: string;
  leadTimeDays: number;
  dependentProducts: number;
  revenueExposedUsd: number;
};

export type RegionExposureRow = {
  iso: string;
  name: string;
  continent: string;
  riskIndex: number;
  facilities: number;
  suppliers: number;
  partsSourced: number;
  productsAffected?: number;
  revenueExposedUsd?: number;
};

export type GlobalStats = {
  products: number;
  components: number;
  suppliers: number;
  facilities: number;
  regions: number;
  singleSourcedComponents: number;
};

export type CatalogRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unitPriceUsd: number;
  annualUnits: number;
  annualRevenueUsd: number;
  totalParts: number;
  singleSourceParts: number;
};

export type SourceRef = { name: string; sharePct: number | null; leadTimeDays: number | null; unitCostUsd: number | null };

export type BomNode = {
  id: string;
  rootModuleId: string;
  name: string;
  kind: "Module" | "Component" | "Product";
  mpn: string | null;
  sourceCount: number | null;
  sources: SourceRef[];
  alternates: string[];
  children: BomNode[];
};

export type RiskItem = {
  mpn: string;
  name: string;
  supplierName: string;
  sharePct: number;
  leadTimeDays: number;
  sites: { site: string; region: string; iso: string }[];
};

export type ProductDetail = {
  catalog: CatalogRow;
  bom: BomNode[];
  risks: RiskItem[];
};

export type FacilityOption = {
  id: string;
  name: string;
  city: string;
  type: string;
  regionIso: string;
  regionName: string;
  regionRiskIndex: number;
  partsSourced: number;
};
