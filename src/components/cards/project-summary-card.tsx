import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProjectStatusBadge } from "./project-status-badge";
import type { ProjectStatus } from "@/types";

interface ProjectSummaryCardProps {
  id: string;
  name: string;
  status: ProjectStatus;
  contractAmount: number;
  clientDue: number;
  profit: number;
  className?: string;
}

export function ProjectSummaryCard({
  id,
  name,
  status,
  contractAmount,
  clientDue,
  profit,
  className,
}: ProjectSummaryCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className={cn(
        "flex min-h-[160px] flex-col justify-between rounded-[24px] bg-card p-4 shadow-card transition-colors hover:bg-muted/30",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-base font-semibold leading-tight">
          {name}
        </p>
        <ProjectStatusBadge status={status} />
      </div>
      <p className="text-xl font-bold tabular-nums leading-tight">
        {formatCurrency(contractAmount)}
      </p>
      <div className="flex flex-col gap-1 text-sm leading-snug">
        <p>
          <span className="text-subtext">Client Due: </span>
          <span className="font-semibold tabular-nums text-warning">
            {formatCurrency(clientDue)}
          </span>
        </p>
        <p>
          <span className="text-subtext">Profit: </span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              profit >= 0 ? "text-success" : "text-danger"
            )}
          >
            {formatCurrency(profit)}
          </span>
        </p>
      </div>
    </Link>
  );
}
