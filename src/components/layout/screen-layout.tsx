import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/design";
import { BrandLogo } from "@/components/brand/brand-logo";

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBrandMark?: boolean;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ScreenLayout({
  title,
  subtitle,
  action,
  showBrandMark,
  children,
  className,
  noPadding,
}: ScreenLayoutProps) {
  return (
    <div className={cn("min-h-screen pb-28", className)}>
      <header className="sticky top-0 z-30 bg-background/90 px-5 pb-4 pt-5 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {showBrandMark && (
              <BrandLogo variant="mark" className="mb-3" />
            )}
            <h1 className={typo("h1", "text-[28px]")}>{title}</h1>
            {subtitle && (
              <p className={cn(typo("caption"), "mt-1")}>{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 pt-1">{action}</div>}
        </div>
      </header>
      <div className={cn(!noPadding && "px-5")}>{children}</div>
    </div>
  );
}
