import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-accent text-primary",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-subtext",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-muted text-subtext",
  },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
