"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type HealthState =
  | { status: "checking" }
  | { status: "ok"; latencyMs: number }
  | { status: "down"; message: string };

/**
 * Live database connectivity indicator. Polls /api/health so a paused
 * CognoDB instance is visible to the user instead of failing silently.
 */
export function DbStatusPill() {
  const [state, setState] = useState<HealthState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const body = (await res.json()) as { status: string; latencyMs?: number; message?: string };
        if (cancelled) return;
        if (body.status === "ok") setState({ status: "ok", latencyMs: body.latencyMs ?? 0 });
        else setState({ status: "down", message: body.message ?? "Database unreachable" });
      } catch {
        if (!cancelled) setState({ status: "down", message: "Could not reach the health endpoint" });
      }
    };

    void check();
    const id = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const dot =
    state.status === "checking" ? "bg-zinc-400" : state.status === "ok" ? "bg-emerald-400 text-emerald-400" : "bg-red-500 text-red-500";
  const label = state.status === "checking" ? "Checking DB…" : state.status === "ok" ? `DB online · ${state.latencyMs}ms` : "DB unreachable";
  const title = state.status === "down" ? state.message : "Connected to CognoDB over Bolt";

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs text-muted-foreground",
        state.status === "down" && "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      <span className="relative size-1.5">
        <span className={cn("absolute inset-0 rounded-full", dot, state.status !== "checking" && "pulse-dot")} />
      </span>
      <span className="font-mono tabular-nums">{label}</span>
    </span>
  );
}
