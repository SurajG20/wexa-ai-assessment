import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, DatabaseZapIcon, SearchXIcon } from "lucide-react";

type Tone = "search" | "error" | "database";

const icons: Record<Tone, ReactNode> = {
  search: <SearchXIcon className="size-6" />,
  error: <AlertTriangleIcon className="size-6" />,
  database: <DatabaseZapIcon className="size-6" />,
};

/** Shared empty / error state block used across pages. */
export function EmptyState({
  title,
  description,
  tone = "search",
  action,
  className,
}: {
  title: string;
  description?: string;
  tone?: Tone;
  action?: ReactNode;
  className?: string;
}) {
  const isError = tone !== "search";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-14 text-center",
        isError && "border-red-500/25 bg-red-500/[0.03]",
        className,
      )}
    >
      <div
        className={cn(
          "grid size-12 place-items-center rounded-full ring-1",
          isError ? "bg-red-500/10 text-red-400 ring-red-500/25" : "bg-secondary text-muted-foreground ring-border",
        )}
      >
        {icons[tone]}
      </div>
      <h3 className={cn("mt-4 text-sm font-semibold", isError && "text-red-300")}>{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-balance text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
