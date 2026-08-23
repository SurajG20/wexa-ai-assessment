/** Number/currency formatting shared across the UI. */

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const exactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactInt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** $3.1T / $850M / $12.4K — for revenue-scale figures. */
export function fmtCompactUsd(n: number): string {
  return compactUsd.format(n);
}

/** $42,490 — for unit prices. */
export function fmtExactUsd(n: number): string {
  return exactUsd.format(n);
}

/** 85M / 4.2K — for unit counts. */
export function fmtCompactInt(n: number): string {
  return compactInt.format(n);
}
