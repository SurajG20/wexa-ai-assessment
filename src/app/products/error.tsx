"use client";

import { PageHeader } from "@/components/page-header";

/** Route-level error boundary for catalog/detail pages (DB down, etc.). */
export default function ProductsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const message = /COGNODB|config/i.test(error.message)
    ? "The database is not configured. Add your CognoDB credentials to .env and restart."
    : "The product graph could not be queried. The CognoDB instance may be paused or unreachable.";

  return (
    <div className="py-10">
      <PageHeader title="Products unavailable" description={message} />
      <button
        onClick={reset}
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
