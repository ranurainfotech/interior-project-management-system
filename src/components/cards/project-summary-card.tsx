import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { hasBudget } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/design";
import { ProjectStatusBadge } from "./project-status-badge";
import type { ProjectStatus } from "@/types";

interface ProjectSummaryCardProps {
  id: string;
  name: string;
  status: ProjectStatus;
  clientEstimate?: number;
  clientDue?: number | null;
  profit: number;
  paidOut?: number;
  className?: string;
  onDelete?: () => void;
  deleting?: boolean;
}

export function ProjectSummaryCard({
  id,
  name,
  status,
  clientEstimate = 0,
  clientDue = null,
  profit,
  paidOut = 0,
  className,
  onDelete,
  deleting,
}: ProjectSummaryCardProps) {
  const estimateSet = hasBudget(clientEstimate);

  return (
    <div
      className={cn(
        "relative rounded-[24px] bg-card shadow-card transition-opacity",
        deleting && "pointer-events-none opacity-50",
        className
      )}
    >
      <Link
        href={`/projects/${id}`}
        className="flex min-h-[160px] flex-col justify-between rounded-[24px] p-4 pr-12 transition-colors hover:bg-muted/30"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-base font-semibold leading-tight">
            {name}
          </p>
          <ProjectStatusBadge status={status} />
        </div>
        <p
          className={cn(
            "text-xl font-bold tabular-nums leading-tight",
            profit >= 0 ? "text-success" : "text-danger"
          )}
        >
          {formatCurrency(profit)}
          <span className="ml-1.5 text-sm font-medium text-subtext">net</span>
        </p>
        <div className="flex flex-col gap-1 text-sm leading-snug">
          <p>
            <span className="text-subtext">Paid out: </span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(paidOut)}
            </span>
          </p>
          {estimateSet && clientDue !== null ? (
            <p>
              <span className="text-subtext">Client pending: </span>
              <span className="font-semibold tabular-nums text-warning">
                {formatCurrency(clientDue)}
              </span>
            </p>
          ) : (
            <p className={typo("caption")}>Cash flow from payments</p>
          )}
        </div>
      </Link>
      {onDelete ? (
        <button
          type="button"
          aria-label={`Delete ${name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-subtext transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
