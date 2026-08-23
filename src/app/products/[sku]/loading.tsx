import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-3 w-28" />
      <div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-8 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-5 lg:col-span-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" style={{ marginLeft: `${(i % 4) * 14}px`, width: `${100 - (i % 4) * 6}%` }} />
          ))}
        </div>
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/70 p-5 lg:col-span-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
