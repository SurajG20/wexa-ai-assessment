import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Dashboard hero metric card. */
export function KpiCard({
  label,
  value,
  sub,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "amber" | "red" | "emerald";
  className?: string;
}) {
  const toneClass = {
    default: "",
    amber: "text-primary",
    red: "text-risk-critical",
    emerald: "text-risk-low",
  }[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/70 p-5 transition-colors hover:border-border",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 right-0 size-32 rounded-full bg-primary/[0.04] blur-2xl transition-opacity group-hover:bg-primary/[0.07]" />
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight", toneClass)}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
