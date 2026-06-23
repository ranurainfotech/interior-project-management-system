"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { formatCurrency } from "@/lib/format";
import { layout } from "@/lib/design";
import type { Transaction } from "@/types";

interface AssignmentTransactionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyName: string;
  roleLabel: string;
  agreedAmount: number;
  paidAmount: number;
  dueAmount: number;
  transactions: Transaction[];
  assignmentType: "labour" | "material";
}

export function AssignmentTransactionsSheet({
  open,
  onOpenChange,
  partyName,
  roleLabel,
  agreedAmount,
  paidAmount,
  dueAmount,
  transactions,
  assignmentType,
}: AssignmentTransactionsSheetProps) {
  const timelineItems: TimelineItem[] = transactions.map((txn) => ({
    id: txn.id,
    date: txn.date,
    title: `Paid ${formatCurrency(txn.amount)}`,
    subtitle: txn.note,
  }));

  const paymentLabel =
    assignmentType === "labour" ? "Labour payment" : "Material payment";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-[24px] border-t-0 px-0 pb-safe"
      >
        <SheetHeader className="border-b border-border px-5 pb-4 text-left">
          <SheetTitle className="text-lg font-semibold">{partyName}</SheetTitle>
          <SheetDescription className="text-sm text-subtext">
            {roleLabel} · {paymentLabel}s on this project
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3 border-b border-border px-5 py-4">
          <div>
            <p className={layout.label}>Agreed</p>
            <p className="mt-1 text-sm font-bold tabular-nums">
              {formatCurrency(agreedAmount)}
            </p>
          </div>
          <div>
            <p className={layout.label}>Paid</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-success">
              {formatCurrency(paidAmount)}
            </p>
          </div>
          <div>
            <p className={layout.label}>Due</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-warning">
              {formatCurrency(dueAmount)}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Payments</p>
          <Timeline
            items={timelineItems}
            emptyMessage={`No ${paymentLabel.toLowerCase()}s recorded for this project yet`}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
