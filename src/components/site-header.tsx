"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DbStatusPill } from "@/components/db-status-pill";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/impact", label: "Impact Simulator" },
  { href: "/products", label: "Products" },
] as const;

function LogoMark() {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5 text-primary" aria-hidden>
        <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight">
            Silicon<span className="text-primary">Trace</span>
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1" aria-label="Main">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <DbStatusPill />
        </div>
      </div>
    </header>
  );
}
