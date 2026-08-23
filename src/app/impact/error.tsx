"use client";

import { PageHeader } from "@/components/page-header";

/**
 * Route-level error boundary for the impact page. The simulator component
 * already surfaces fetch errors inline; this catches failures in the server
 * shell itself (e.g. the facilities picker query when CognoDB is down).
 */
export default function ImpactError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-10">
      <PageHeader title="Could not load the simulator" description={error.message} />
      <button
        onClick={reset}
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
