import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { RankedItem } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface RankedAmountListProps {
  items: RankedItem[];
  emptyMessage?: string;
  variant?: "default" | "danger";
  showBar?: boolean;
  maxAmount?: number;
}

export function RankedAmountList({
  items,
  emptyMessage = "Nothing to show yet",
  variant = "default",
  showBar = true,
  maxAmount,
}: RankedAmountListProps) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-subtext">{emptyMessage}</p>
    );
  }

  const barMax = maxAmount ?? items[0]?.amount ?? 1;

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{item.label}</p>
                {item.subtitle ? (
                  <p className="mt-0.5 text-xs text-subtext">{item.subtitle}</p>
                ) : null}
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-bold tabular-nums",
                  variant === "danger" ? "text-danger" : "text-foreground"
                )}
              >
                {formatCurrency(item.amount)}
              </p>
            </div>
            {showBar ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    variant === "danger" ? "bg-danger" : "bg-primary"
                  )}
                  style={{ width: `${(item.amount / barMax) * 100}%` }}
                />
              </div>
            ) : null}
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "block rounded-2xl p-3 transition-colors hover:bg-muted/40",
                variant === "danger" &&
                  "bg-danger/5 ring-1 ring-danger/15 hover:bg-danger/10"
              )}
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl p-3",
              variant === "danger" && "bg-danger/5 ring-1 ring-danger/15"
            )}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
