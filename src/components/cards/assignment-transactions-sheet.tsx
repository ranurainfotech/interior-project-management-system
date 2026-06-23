"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionTimeline } from "@/components/cards/transaction-timeline";
import { formatCurrency } from "@/lib/format";
import { hasBudget } from "@/lib/calculations";
import { layout } from "@/lib/design";
import type { Transaction, Party, Project } from "@/types";

interface AssignmentTransactionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyName: string;
  roleLabel: string;
  agreedAmount: number;
  paidAmount: number;
  dueAmount: number | null;
  overpaidAmount: number;
  hasBudget: boolean;
  transactions: Transaction[];
  assignmentType: "labour" | "material";
  parties: Party[];
  projects: Project[];
  onUpdated?: () => void | Promise<void>;
}

export function AssignmentTransactionsSheet({
  open,
  onOpenChange,
  partyName,
  roleLabel,
  agreedAmount,
  paidAmount,
  dueAmount,
  overpaidAmount,
  hasBudget: budgetSet,
  transactions,
  assignmentType,
  parties,
  projects,
  onUpdated,
}: AssignmentTransactionsSheetProps) {
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

        <div
          className={`grid gap-3 border-b border-border px-5 py-4 ${
            budgetSet ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {budgetSet && hasBudget(agreedAmount) ? (
            <div>
              <p className={layout.label}>Budget</p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {formatCurrency(agreedAmount)}
              </p>
            </div>
          ) : null}
          <div>
            <p className={layout.label}>Paid</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-success">
              {formatCurrency(paidAmount)}
            </p>
          </div>
          {budgetSet && dueAmount !== null ? (
            <div>
              <p className={layout.label}>Due</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-warning">
                {formatCurrency(dueAmount)}
              </p>
            </div>
          ) : null}
        </div>

        {overpaidAmount > 0 ? (
          <p className="border-b border-border px-5 py-3 text-sm font-semibold text-danger">
            Overpaid by {formatCurrency(overpaidAmount)}
          </p>
        ) : null}

        <div className="overflow-y-auto px-5 py-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Payments</p>
          <TransactionTimeline
            transactions={transactions}
            parties={parties}
            projects={projects}
            onUpdated={onUpdated}
            titleForTransaction={(txn) => `Paid ${formatCurrency(txn.amount)}`}
            subtitleForTransaction={(txn) => txn.note}
            emptyMessage={`No ${paymentLabel.toLowerCase()}s recorded for this project yet`}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
