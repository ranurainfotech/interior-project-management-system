import { Badge } from "@/components/ui/badge";
import { getTransactionTypeLabel } from "@/constants";
import type { TransactionType } from "@/types";
import { cn } from "@/lib/utils";

const typeStyles: Record<TransactionType, string> = {
  client_payment:
    "border-success/30 bg-success/10 text-success",
  labour_payment:
    "border-accent-brand/30 bg-accent-brand/10 text-ink",
  material_payment:
    "border-border bg-muted text-foreground",
  expense:
    "border-warning/30 bg-warning/10 text-warning-foreground",
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const label = getTransactionTypeLabel(type) ?? type;
  return (
    <Badge variant="outline" className={cn("font-medium", typeStyles[type])}>
      {label}
    </Badge>
  );
}
