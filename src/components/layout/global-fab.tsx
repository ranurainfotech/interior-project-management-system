"use client";

import { usePathname } from "next/navigation";
import { Fab } from "@/components/ui/fab";

const HIDDEN_PREFIXES = ["/login", "/projects/new", "/parties/new", "/transactions/new"];

export function GlobalFab() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return (
      <Fab
        href={`/transactions/new?projectId=${projectMatch[1]}`}
        label="Add payment"
      />
    );
  }

  if (pathname.startsWith("/parties/") || pathname.startsWith("/projects/")) {
    return <Fab href="/transactions/new" label="Quick add" />;
  }

  const hrefByRoute: Record<string, string> = {
    "/dashboard": "/transactions/new",
    "/projects": "/projects/new",
    "/transactions": "/transactions/new",
    "/parties": "/parties/new",
    "/more": "/transactions/new",
  };

  const href = hrefByRoute[pathname];
  if (!href) return null;

  return <Fab href={href} />;
}
