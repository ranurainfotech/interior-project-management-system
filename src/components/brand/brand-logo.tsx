import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

type BrandLogoVariant = "full" | "mark";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  theme?: "dark" | "light";
  className?: string;
  priority?: boolean;
}

const sizes = {
  full: { width: 238, height: 243 },
} as const;

export function BrandLogo({
  variant = "full",
  theme = "dark",
  className,
  priority,
}: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <div
        className={cn(
          "h-9 w-9 shrink-0 overflow-hidden rounded-lg",
          className
        )}
      >
        <Image
          src={BRAND.assets.icon}
          alt={BRAND.name}
          width={36}
          height={36}
          priority={priority}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const { width, height } = sizes.full;
  const src = theme === "light" ? BRAND.assets.logoWhite : BRAND.assets.logo;

  return (
    <Image
      src={src}
      alt={BRAND.name}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn(
        "block shrink-0 object-contain object-center",
        "h-auto w-full max-w-[240px]",
        className
      )}
    />
  );
}
