import { BrandLogo } from "./brand-logo";
import { BRAND } from "@/lib/brand";
import { typo } from "@/lib/design";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function BrandLockup({
  subtitle = BRAND.product,
  className,
  centered = true,
}: BrandLockupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        centered && "items-center text-center",
        className
      )}
    >
      <BrandLogo variant="full" priority />
      {subtitle && (
        <p
          className={cn(
            typo("caption"),
            "uppercase tracking-[0.2em] text-accent-brand"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
