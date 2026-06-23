"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, mainRoutes } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  if (!mainRoutes.has(pathname)) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="pointer-events-auto w-full border-t border-border bg-card pb-safe">
        <div className="flex h-[72px] items-stretch justify-around px-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5",
                    isActive ? "text-primary" : "text-subtext"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-0.5 inset-y-2 rounded-2xl bg-accent" />
                  )}
                  <Icon
                    className="relative z-10 h-[22px] w-[22px]"
                    strokeWidth={isActive ? 2.25 : 2}
                  />
                  <span className="relative z-10 max-w-full truncate text-[10px] font-medium leading-none">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
    </div>
  );
}
