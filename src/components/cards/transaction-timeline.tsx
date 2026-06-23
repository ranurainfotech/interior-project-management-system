"use client";

import { useMemo } from "react";
import { Pencil } from "lucide-react";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { EditTransactionDialog } from "@/components/forms/edit-transaction-dialog";
import { formatCurrency } from "@/lib/format";
import type { Transaction, Party, Project } from "@/types";

export function getTransactionTitle(
  txn: Transaction,
  partyMap: Map<string, Party>
): string {
  switch (txn.transactionType) {
    case "client_payment":
      return `Received ${formatCurrency(txn.amount)} from Client`;
    case "labour_payment":
      return `Paid ${formatCurrency(txn.amount)} to ${partyMap.get(txn.partyId ?? "")?.name ?? "labour"}`;
    case "material_payment":
      return `Paid ${formatCurrency(txn.amount)} to ${partyMap.get(txn.partyId ?? "")?.name ?? "vendor"}`;
    case "expense":
      return `Expense ${formatCurrency(txn.amount)}`;
    default:
      return formatCurrency(txn.amount);
  }
}

interface TransactionTimelineProps {
  transactions: Transaction[];
  parties: Party[];
  projects: Project[];
  onUpdated?: () => void | Promise<void>;
  titleForTransaction?: (txn: Transaction) => string;
  subtitleForTransaction?: (txn: Transaction) => string | undefined;
  emptyMessage?: string;
}

export function TransactionTimeline({
  transactions,
  parties,
  projects,
  onUpdated,
  titleForTransaction,
  subtitleForTransaction,
  emptyMessage = "No transactions yet",
}: TransactionTimelineProps) {
  const partyMap = useMemo(
    () => new Map(parties.map((p) => [p.id, p])),
    [parties]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const items: TimelineItem[] = transactions.map((txn) => ({
    id: txn.id,
    date: txn.date,
    title: titleForTransaction?.(txn) ?? getTransactionTitle(txn, partyMap),
    subtitle:
      subtitleForTransaction?.(txn) ??
      [projectMap.get(txn.projectId)?.name, txn.note]
        .filter(Boolean)
        .join(" · "),
    action: (
      <EditTransactionDialog
        transaction={txn}
        onSuccess={() => void onUpdated?.()}
        trigger={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-subtext hover:bg-muted hover:text-foreground"
            aria-label="Edit transaction"
          >
            <Pencil className="h-4 w-4" />
          </button>
        }
      />
    ),
  }));

  return <Timeline items={items} emptyMessage={emptyMessage} />;
}
