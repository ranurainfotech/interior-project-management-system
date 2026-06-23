"use client";

import { usePathname } from "next/navigation";
import { shouldShowBottomNav } from "@/components/layout/nav-items";
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
  const pathname = usePathname();
  const hasBottomNav = shouldShowBottomNav(pathname);

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 z-40 md:left-[var(--sidebar-w)]",
        hasBottomNav
          ? "bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px))]"
          : "bottom-0",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-auto border-t border-border bg-card px-4 pt-4",
          hasBottomNav
            ? "pb-4"
            : "pb-[calc(env(safe-area-inset-bottom,0px)+16px)]",
          "md:mx-auto md:max-w-2xl md:rounded-t-2xl md:pb-4"
        )}
      >
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
