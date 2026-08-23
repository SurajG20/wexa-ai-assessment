import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 px-6 py-10 sm:px-10">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="mt-4 h-8 w-2/3 max-w-xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/70 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border/60 bg-card/70 lg:col-span-3">
          <div className="px-6 pt-6">
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex h-[300px] items-end gap-3 p-6">
            {[70, 45, 85, 30, 60, 50, 75, 40, 55].map((h, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-4 lg:col-span-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
