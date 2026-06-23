import { cn } from "@/lib/utils";
import { typo } from "@/lib/design";

interface MetricCardProps {
  amount: string;
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

const amountColors = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  accent: "text-accent-brand",
};

export function MetricCard({
  amount,
  label,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5",
        className
      )}
    >
      <p
        className={cn(
          "text-[28px] font-semibold leading-none tracking-tight tabular-nums",
          amountColors[variant]
        )}
      >
        {amount}
      </p>
      <p className={cn(typo("caption"), "mt-3")}>{label}</p>
    </div>
  );
}
