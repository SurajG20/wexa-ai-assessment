import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { RiskBadge, riskLevel } from "@/components/risk-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCatalog } from "@/lib/services";
import { cn } from "@/lib/utils";
import { fmtCompactInt, fmtCompactUsd, fmtExactUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Product catalog" };

const CATEGORIES = ["Phone", "Laptop", "Tablet", "Wearable", "Audio", "Console", "AI System", "EV", "Networking"] as const;

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : null;
  const query = (typeof params.q === "string" ? params.q : "").trim().toLowerCase();

  const all = await getCatalog();
  const products = all.filter((p) => {
    if (category && p.category !== category) return false;
    if (query && !`${p.name} ${p.brand} ${p.sku}`.toLowerCase().includes(query)) return false;
    return true;
  });

  const qs = (over: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { category: category ?? undefined, q: query || undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finished goods"
        title="Product catalog"
        description="Every product in the graph, with the depth of its bill of material and how many parts have no qualified second source."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={qs({ category: undefined })}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            !category ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-border hover:text-foreground",
          )}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={qs({ category: cat })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === cat ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {cat}
          </Link>
        ))}

        <form action="/products" className="ml-auto">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search products…"
              className="h-8 w-52 rounded-md border border-input bg-input/20 pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/70">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Annual units</TableHead>
              <TableHead className="text-right">BOM parts</TableHead>
              <TableHead className="text-right">Sole-sourced</TableHead>
              <TableHead className="text-right">Annual revenue</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const soleRatio = p.totalParts > 0 ? Math.round((p.singleSourceParts / p.totalParts) * 100) : 0;
              return (
                <TableRow key={p.sku}>
                  <TableCell>
                    <Link href={`/products/${p.sku}`} className="group block">
                      <span className="font-medium group-hover:text-primary">{p.name}</span>
                      <span className="block font-mono text-[11px] tabular-nums text-muted-foreground">{p.sku}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">{p.category}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{p.brand}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{fmtExactUsd(p.unitPriceUsd)}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">{fmtCompactInt(p.annualUnits)}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{p.totalParts}</TableCell>
                  <TableCell className="text-right">
                    {p.singleSourceParts > 0 ? (
                      <RiskBadge level={riskLevel(Math.max(soleRatio, 25))} className="scale-95" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {p.singleSourceParts > 0 ? (
                      <span className="mt-1 block font-mono text-[10px] tabular-nums text-muted-foreground">
                        {p.singleSourceParts}/{p.totalParts} parts
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium tabular-nums">{fmtCompactUsd(p.annualRevenueUsd)}</TableCell>
                  <TableCell>
                    <ChevronRightIcon className="size-4 text-muted-foreground/50" />
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No products match"
                    description={`Nothing matches ${[category, query].filter(Boolean).join(" / ")}. Try clearing the filters.`}
                    className="border-0"
                    action={
                      <Link href="/products" className="text-sm text-primary underline-offset-4 hover:underline">
                        Clear filters
                      </Link>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
