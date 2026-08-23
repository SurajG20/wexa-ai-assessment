import { cn } from "@/lib/utils";

export type RiskLevel = "critical" | "high" | "medium" | "low";

/** Map a 0–100 exposure score to a severity bucket. */
export function riskLevel(exposureScore: number): RiskLevel {
  if (exposureScore >= 90) return "critical";
  if (exposureScore >= 60) return "high";
  if (exposureScore >= 30) return "medium";
  return "low";
}

const styles: Record<RiskLevel, string> = {
  critical: "bg-risk-critical/15 text-risk-critical ring-risk-critical/40",
  high: "bg-risk-high/15 text-risk-high ring-risk-high/40",
  medium: "bg-risk-medium/15 text-risk-medium ring-risk-medium/40",
  low: "bg-risk-low/15 text-risk-low ring-risk-low/40",
};

const labels: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset",
        styles[level],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[level]}
    </span>
  );
}
