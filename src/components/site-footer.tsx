import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-medium text-foreground/80">SiliconTrace</span> — semiconductor supply-chain risk explorer.
          Data is illustrative; supplier relationships approximate public knowledge.
        </p>
        <p className="font-mono tabular-nums">
          Next.js · neo4j-driver over Bolt · <Link href="https://cognodb.com" className="underline-offset-2 hover:underline">CognoDB</Link>
        </p>
      </div>
    </footer>
  );
}
