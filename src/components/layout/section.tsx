import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-semibold leading-tight text-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function HorizontalScroll({
  children,
  className,
  columns = 1,
}: {
  children: ReactNode;
  className?: string;
  /** Grid columns from sm breakpoint upward (1 = stay horizontal scroll) */
  columns?: 1 | 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "sm:grid sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "sm:grid sm:grid-cols-2 lg:grid-cols-3"
        : columns === 2
          ? "sm:grid sm:grid-cols-2"
          : "";

  return (
    <div
      className={cn(
        "-mx-4 scroll-x px-4",
        columns > 1 && "sm:mx-0 sm:scroll-auto sm:px-0",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max gap-3 pb-1",
          columns > 1 && "sm:w-full sm:gap-4",
          gridClass
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("app-page", className)}>{children}</div>;
}

export function MetricCell({
  label,
  value,
  valueClassName,
  light,
  size = "md",
}: {
  label: string;
  value: string;
  valueClassName?: string;
  light?: boolean;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass =
    size === "xl"
      ? "text-xl font-bold sm:text-2xl"
      : size === "lg"
        ? "text-lg font-bold sm:text-xl"
        : "stat-value";

  return (
    <div className="min-w-0 flex-1 text-center">
      <p
        className={cn(
          sizeClass,
          "leading-tight tabular-nums",
          light ? "text-white" : "text-foreground",
          valueClassName
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[11px] leading-tight",
          light ? "text-white/75" : "text-subtext"
        )}
      >
        {label}
      </p>
    </div>
  );
}
