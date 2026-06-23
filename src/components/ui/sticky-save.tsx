"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickySaveProps {
  label?: string;
  loading?: boolean;
  form?: string;
  onClick?: () => void;
  type?: "submit" | "button";
  className?: string;
}

export function StickySave({
  label = "Save",
  loading,
  form,
  onClick,
  type = "submit",
  className,
}: StickySaveProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-0 left-0 right-0 z-40 md:left-[var(--sidebar-w)]",
        className
      )}
    >
      <div className="pointer-events-auto border-t border-border bg-card px-4 py-4 pb-safe md:mx-auto md:max-w-2xl md:rounded-t-2xl">
        <Button
          type={type}
          form={form}
          onClick={onClick}
          disabled={loading}
          className="h-14 w-full rounded-2xl text-base font-semibold"
        >
          {loading ? "Saving..." : label}
        </Button>
      </div>
    </div>
  );
}
