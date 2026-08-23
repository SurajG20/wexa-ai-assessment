import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-primary/80">404 · SKU unknown</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">This product is not in the graph</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The SKU you followed does not exist in the seeded dataset. Head back to the catalog to browse what is loaded.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
