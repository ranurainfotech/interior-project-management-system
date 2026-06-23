import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  valueClassName?: string;
  className?: string;
}

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  valueClassName,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-[20px] bg-card p-4 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug text-subtext">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
      </div>
      <p
        className={cn(
          "mt-2 text-xl font-bold tabular-nums leading-tight",
          valueClassName
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-snug text-subtext">{hint}</p>
      ) : null}
    </div>
  );
}
