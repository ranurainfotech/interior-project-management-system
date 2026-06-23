import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { hasBudget } from "@/lib/calculations";
import type { ProjectHealthItem } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ProjectHealthList({ items }: { items: ProjectHealthItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-subtext">No active projects</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isLoss = item.profit < 0;
        return (
          <Link
            key={item.projectId}
            href={`/projects/${item.projectId}`}
            className={cn(
              "flex items-center gap-3 rounded-[20px] bg-card p-4 shadow-card transition-colors hover:bg-muted/30",
              isLoss && "ring-1 ring-danger/20"
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-subtext">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{item.name}</p>
              <p className="mt-0.5 text-xs text-subtext">
                {hasBudget(item.contractAmount)
                  ? `Estimate ${formatCurrency(item.contractAmount)}`
                  : "Payments tracked"}
                {item.clientDue !== null && item.clientDue > 0
                  ? ` · ${formatCurrency(item.clientDue)} pending`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-subtext">{isLoss ? "Loss" : "Net"}</p>
              <p
                className={cn(
                  "text-base font-bold tabular-nums",
                  isLoss ? "text-danger" : "text-success"
                )}
              >
                {formatCurrency(item.profit)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
