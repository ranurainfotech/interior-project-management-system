import { format, subMonths, startOfMonth } from "date-fns";
import {
  getAssignmentSummaries,
  getClientReceived,
  getProjectExpenses,
  sumTransactions,
} from "@/lib/calculations";
import type { Party, ProjectParty, Transaction } from "@/types";
import type { BreakdownSlice, MonthlyCashFlow, RankedItem } from "./types";
import { CHART_COLORS } from "./dashboard";

export function getProjectExpenseBreakdown(
  transactions: Transaction[]
): BreakdownSlice[] {
  const labour = sumTransactions(transactions, ["labour_payment"]);
  const material = sumTransactions(transactions, ["material_payment"]);
  const misc = sumTransactions(transactions, ["expense"]);
  const total = labour + material + misc;

  if (total === 0) {
    return [
      { label: "Labour", amount: 0, percent: 0, color: CHART_COLORS.labour },
      { label: "Material", amount: 0, percent: 0, color: CHART_COLORS.material },
      { label: "Misc", amount: 0, percent: 0, color: CHART_COLORS.misc },
    ];
  }

  return [
    {
      label: "Labour",
      amount: labour,
      percent: Math.round((labour / total) * 100),
      color: CHART_COLORS.labour,
    },
    {
      label: "Material",
      amount: material,
      percent: Math.round((material / total) * 100),
      color: CHART_COLORS.material,
    },
    {
      label: "Misc",
      amount: misc,
      percent: Math.round((misc / total) * 100),
      color: CHART_COLORS.misc,
    },
  ];
}

export function getProjectLabourBreakdown(
  projectParties: ProjectParty[],
  parties: Party[],
  transactions: Transaction[]
): RankedItem[] {
  const summaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "labour"
  );

  return summaries
    .map(({ party, paidAmount, projectParty }) => ({
      id: party.id,
      label: party.name,
      amount: paidAmount,
      subtitle: projectParty.skillUsed ?? "Labour",
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function getProjectMaterialBreakdown(
  projectParties: ProjectParty[],
  parties: Party[],
  transactions: Transaction[]
): RankedItem[] {
  const summaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "material"
  );

  return summaries
    .map(({ party, paidAmount, projectParty }) => ({
      id: party.id,
      label: party.name,
      amount: paidAmount,
      subtitle: projectParty.categoryUsed ?? "Material",
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function getProjectProfitTrend(
  transactions: Transaction[],
  months = 6
): MonthlyCashFlow[] {
  const now = startOfMonth(new Date());
  const buckets: MonthlyCashFlow[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(now, i);
    const monthKey = format(d, "yyyy-MM");
    buckets.push({
      monthKey,
      monthLabel: format(d, "MMM"),
      received: 0,
      paid: 0,
      net: 0,
    });
  }

  const bucketMap = new Map(buckets.map((b) => [b.monthKey, b]));

  for (const txn of transactions) {
    const key = txn.date.slice(0, 7);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;

    if (txn.transactionType === "client_payment") {
      bucket.received += txn.amount;
    } else {
      bucket.paid += txn.amount;
    }
    bucket.net = bucket.received - bucket.paid;
  }

  let cumulative = 0;
  return buckets.map((bucket) => {
    cumulative += bucket.net;
    return { ...bucket, net: cumulative };
  });
}

export function getProjectCollectionPercent(
  contractAmount: number,
  transactions: Transaction[]
): number {
  if (contractAmount <= 0) return 0;
  const received = getClientReceived(transactions);
  return Math.min(100, Math.round((received / contractAmount) * 100));
}

export function getProjectTotalExpenses(transactions: Transaction[]): number {
  return getProjectExpenses(transactions);
}
