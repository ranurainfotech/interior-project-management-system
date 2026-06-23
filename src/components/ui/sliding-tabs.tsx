"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SlidingTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: SlidingTabsProps<T>) {
  const pillId = useId();

  return (
    <div className={cn("w-full", className)} role="tablist">
      <div className="relative flex w-full gap-1 rounded-2xl bg-muted p-1">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl px-1.5 py-2 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-subtext"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 rounded-xl bg-card shadow-card"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 truncate text-center leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
