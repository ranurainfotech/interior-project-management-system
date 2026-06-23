"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentControlProps<T>) {
  const pillId = useId();

  return (
    <div
      className={cn("flex rounded-2xl bg-muted p-1", className)}
      role="tablist"
    >
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
              "relative min-h-[44px] flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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
            <span className="relative z-10 truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
