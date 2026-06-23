"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/brand/brand-logo";
import { navItems } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-w)] shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
        >
          <BrandLogo variant="mark" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              Abhyantar
            </p>
            <p className="truncate text-[11px] text-subtext">
              {BRAND.product}
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-primary"
                  : "text-subtext hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
