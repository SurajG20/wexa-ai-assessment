"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  CircuitBoardIcon,
  LayersIcon,
  PackageIcon,
  RepeatIcon,
} from "lucide-react";
import type { BomNode } from "@/lib/services/types";
import { cn } from "@/lib/utils";

/**
 * Interactive bill-of-material tree. Nodes collapse independently; component
 * leaves expose their supplier chain (share %, lead time) and alternate parts.
 */
export function BomTree({ nodes }: { nodes: BomNode[] }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} defaultOpen />
      ))}
    </ul>
  );
}

function TreeNode({ node, defaultOpen = false }: { node: BomNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const isModule = node.kind === "Module";
  const singleSourced = node.kind === "Component" && node.sourceCount === 1;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors",
          "hover:border-border hover:bg-secondary/30",
          singleSourced && "bg-risk-critical/[0.04]",
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-transform hover:text-foreground data-[open=true]:rotate-90"
            data-open={open}
          >
            <ChevronRightIcon className="size-3.5" />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}

        {isModule ? (
          hasChildren ? <LayersIcon className="size-4 shrink-0 text-primary/70" /> : <CircuitBoardIcon className="size-4 shrink-0 text-primary/50" />
        ) : (
          <PackageIcon className={cn("size-4 shrink-0", singleSourced ? "text-risk-critical" : "text-muted-foreground")} />
        )}

        <span className={cn("truncate text-sm", isModule ? "font-medium" : "text-muted-foreground")} title={node.name}>
          {node.name}
        </span>

        {node.mpn ? <span className="hidden font-mono text-[10px] text-muted-foreground/70 sm:inline">{node.mpn}</span> : null}

        {singleSourced ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-risk-critical/10 px-1.5 py-0.5 text-[10px] font-medium text-risk-critical ring-1 ring-risk-critical/30 ring-inset">
            <AlertTriangleIcon className="size-2.5" /> sole source
          </span>
        ) : null}

        {node.alternates.length > 0 ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
            title={`Qualified alternates: ${node.alternates.join(", ")}`}
          >
            <RepeatIcon className="size-2.5" /> {node.alternates.length}
          </span>
        ) : null}

        {/* Supplier chain */}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
          {node.sources.map((s) => (
            <span
              key={s.name}
              title={`${s.name}${s.sharePct !== null ? ` · ${Math.round(s.sharePct)}% of supply` : ""}${
                s.leadTimeDays !== null ? ` · ${s.leadTimeDays}-day lead time` : ""
              }`}
              className={cn(
                "max-w-[150px] truncate rounded bg-secondary/80 px-1.5 py-0.5 text-[11px]",
                node.sources.length > 1 ? "text-muted-foreground" : "text-foreground/80",
              )}
            >
              {s.name}
              {s.sharePct !== null && node.sources.length > 1 ? ` · ${Math.round(s.sharePct)}%` : ""}
            </span>
          ))}
        </span>
      </div>

      {hasChildren && open ? (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-border/40 pl-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
