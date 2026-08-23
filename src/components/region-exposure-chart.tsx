"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RegionExposureRow } from "@/lib/services/types";
import { fmtCompactUsd } from "@/lib/format";

/**
 * Downstream revenue exposure by region. Bars are tinted red when the
 * region's geopolitical risk index crosses the high threshold.
 */
export function RegionExposureChart({ data }: { data: RegionExposureRow[] }) {
  const top = data.filter((r) => (r.revenueExposedUsd ?? 0) > 0).slice(0, 9);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => fmtCompactUsd(v)}
            tick={{ fill: "#8b93a2", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tick={{ fill: "#c6ccd6", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as RegionExposureRow;
              return (
                <div className="rounded-lg border border-border/80 bg-popover px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium">{row.name}</p>
                  <dl className="mt-1 space-y-0.5 font-mono tabular-nums text-muted-foreground">
                    <div>Revenue exposed · <span className="text-foreground">{fmtCompactUsd(row.revenueExposedUsd ?? 0)}</span></div>
                    <div>Products affected · <span className="text-foreground">{row.productsAffected}</span></div>
                    <div>Risk index · <span className="text-foreground">{row.riskIndex}/100</span></div>
                  </dl>
                </div>
              );
            }}
          />
          <Bar dataKey="revenueExposedUsd" radius={[0, 4, 4, 0]} barSize={16}>
            {top.map((row) => (
              <Cell key={row.iso} fill={row.riskIndex >= 65 ? "#e05555" : row.riskIndex >= 40 ? "#e8a33d" : "#57b98a"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
