"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  /** Shown when there is no in-app history to return to */
  backHref?: string;
  onBack?: () => void;
  menu?: ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  backHref,
  onBack,
  menu,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  const showBack = Boolean(backHref ?? onBack);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const canGoBack =
      typeof window !== "undefined" && window.history.length > 1;

    if (canGoBack) {
      router.back();
      return;
    }

    if (backHref) {
      router.push(backHref);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[40px_1fr_40px] items-center gap-2 border-b border-border/50 bg-background px-4 md:grid-cols-[48px_1fr_48px] md:px-0",
        className
      )}
    >
      <div className="flex items-center justify-start">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground active:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <h1 className="truncate text-center text-[17px] font-semibold leading-tight text-foreground">
        {title}
      </h1>
      <div className="flex items-center justify-end">{menu ?? null}</div>
    </header>
  );
}
