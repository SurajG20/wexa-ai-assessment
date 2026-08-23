/**
 * Schema definitions: uniqueness constraints keep the seed loader idempotent
 * (MERGE relies on these indexes) and speed up keyed lookups at query time.
 */
export const CONSTRAINTS: { label: string; property: string; name: string }[] = [
  { label: "Product", property: "sku", name: "product_sku_unique" },
  { label: "Module", property: "id", name: "module_id_unique" },
  { label: "Component", property: "mpn", name: "component_mpn_unique" },
  { label: "Supplier", property: "id", name: "supplier_id_unique" },
  { label: "Facility", property: "id", name: "facility_id_unique" },
  { label: "Region", property: "iso", name: "region_iso_unique" },
];

export function constraintCypher({ label, property, name }: (typeof CONSTRAINTS)[number]): string {
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${property} IS UNIQUE`;
}
