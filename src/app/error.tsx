"use client";

import { PageHeader } from "@/components/page-header";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const message = /COGNODB|config/i.test(error.message)
    ? "The database is not configured. Copy .env.example to .env and add your CognoDB credentials, then restart the server."
    : "The graph database could not be queried. The CognoDB instance may be paused or unreachable.";

  return (
    <div className="py-16">
      <PageHeader
        title="Something broke in the graph"
        description={message}
      />
      <pre className="mt-6 overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
