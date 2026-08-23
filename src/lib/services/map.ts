import type { Record as Neo4jRecord } from "neo4j-driver";

/** Small helpers for mapping driver records to typed DTOs. */

export function str(record: Neo4jRecord, key: string): string {
  const v = record.get(key);
  if (v === null || v === undefined) throw new Error(`Expected non-null string for "${key}"`);
  return String(v);
}

export function optStr(record: Neo4jRecord, key: string): string | null {
  const v = record.get(key);
  return v === null || v === undefined ? null : String(v);
}

export function num(record: Neo4jRecord, key: string, fallback = 0): number {
  const v = record.get(key);
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "object" && "toNumber" in (v as object) ? (v as { toNumber(): number }).toNumber() : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function list<T>(record: Neo4jRecord, key: string): T[] {
  const v = record.get(key);
  return Array.isArray(v) ? (v as T[]) : [];
}
