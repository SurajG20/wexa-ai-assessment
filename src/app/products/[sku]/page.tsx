import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftIcon, MapPinIcon, TimerIcon } from "lucide-react";
import { BomTree } from "./bom-tree";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RiskBadge, riskLevel } from "@/components/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductDetail } from "@/lib/services";
import { NotFoundError } from "@/lib/errors";
import { fmtCompactInt, fmtCompactUsd, fmtExactUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<'/products/[sku]'>): Promise<Metadata> {
  const { sku } = await params;
  return { title: sku };
}

export default async function ProductDetailPage({ params }: PageProps<'/products/[sku]'>) {
  const { sku } = await params;

  let detail;
  try {
    detail = await getProductDetail(sku);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const { catalog, bom, risks } = detail;
  const soleRatio = catalog.totalParts > 0 ? Math.round((catalog.singleSourceParts / catalog.totalParts) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-3.5" /> Back to catalog
      </Link>

      <PageHeader
        eyebrow={`${catalog.brand} · ${catalog.sku}`}
        title={catalog.name}
        actions={<RiskBadge level={riskLevel(Math.max(soleRatio, 20))} className="scale-110" />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Unit price" value={fmtExactUsd(catalog.unitPriceUsd)} sub={catalog.category} />
        <KpiCard label="Annual units" value={fmtCompactInt(catalog.annualUnits)} />
        <KpiCard label="Annual revenue" value={fmtCompactUsd(catalog.annualRevenueUsd)} tone="amber" />
        <KpiCard
          label="BOM depth"
          value={`${catalog.totalParts} parts`}
          tone={catalog.singleSourceParts > 0 ? "red" : "emerald"}
          sub={`${catalog.singleSourceParts} sole-sourced (${soleRatio}%)`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="border-border/60 bg-card/70 lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Bill of material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BomTree nodes={bom} />
          </CardContent>
        </Card>

        <Card className="h-fit border-border/60 bg-card/70 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Top supply chokepoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks.map((r) => (
              <div key={r.mpn} className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums ring-1 ring-inset ${
                      r.sharePct >= 99
                        ? "bg-risk-critical/10 text-risk-critical ring-risk-critical/30"
                        : "bg-secondary text-muted-foreground ring-border"
                    }`}
                  >
                    {Math.round(r.sharePct)}%
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <TimerIcon className="size-3" /> {r.leadTimeDays}-day lead · via {r.supplierName}
                </p>
                {r.sites.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {r.sites.map((s) => (
                      <span
                        key={s.site}
                        title={`${s.site}, ${s.region}`}
                        className={`inline-flex max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ring-1 ring-inset ${
                          s.iso === "TW" || s.iso === "IL"
                            ? "bg-risk-critical/10 text-risk-critical ring-risk-critical/25"
                            : "bg-secondary/70 text-muted-foreground ring-border/60"
                        }`}
                      >
                        <MapPinIcon className="size-2.5 shrink-0" />
                        <span className="truncate">{s.site}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {risks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No chokepoint data.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
