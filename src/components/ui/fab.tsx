"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps {
  href: string;
  label?: string;
  className?: string;
}

export function Fab({ href, label = "Quick add", className }: FabProps) {
  return (
    <>
      {/* Mobile: aligned to phone-width column */}
      <div className="pointer-events-none fixed bottom-[calc(var(--nav-h)+16px+env(safe-area-inset-bottom,0px))] right-4 z-40 md:hidden">
        <Link
          href={href}
          aria-label={label}
          className={cn(
            "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card transition-transform active:scale-95",
            className
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      </div>
      {/* Desktop: bottom-right of main area */}
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card transition-transform hover:scale-105 active:scale-95 md:flex",
          className
        )}
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>
    </>
  );
}
