import { format, subMonths, startOfMonth } from "date-fns";
import {
  getAssignmentSummaries,
  getPartyPaidAmount,
  getProjectSummary,
  sumTransactions,
} from "@/lib/calculations";
import type {
  Party,
  Project,
  ProjectParty,
  Transaction,
} from "@/types";
import type {
  BreakdownSlice,
  MonthlyCashFlow,
  ProjectHealthItem,
  RankedItem,
} from "./types";

const CHART_COLORS = {
  labour: "#1e3a8a",
  material: "#f59e0b",
  misc: "#6b7280",
  received: "#16a34a",
  paid: "#dc2626",
};

export function getMonthlyCashFlow(
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
  }

  for (const bucket of buckets) {
    bucket.net = bucket.received - bucket.paid;
  }

  return buckets;
}

export function getProjectsByProfit(
  projects: Project[],
  projectParties: ProjectParty[],
  transactions: Transaction[]
): ProjectHealthItem[] {
  return projects
    .filter((p) => p.status === "active")
    .map((project) => {
      const pp = projectParties.filter((x) => x.projectId === project.id);
      const txns = transactions.filter((t) => t.projectId === project.id);
      const summary = getProjectSummary(project, pp, txns);
      return {
        projectId: project.id,
        name: project.name,
        profit: summary.profit,
        clientDue: summary.clientDue,
        contractAmount: project.contractAmount,
      };
    })
    .sort((a, b) => b.profit - a.profit);
}

export function getTopLabourBySpend(
  parties: Party[],
  transactions: Transaction[],
  limit = 5
): RankedItem[] {
  const labourParties = new Map(
    parties.filter((p) => p.partyType === "labour").map((p) => [p.id, p])
  );
  const totals = new Map<string, number>();

  for (const txn of transactions) {
    if (txn.transactionType !== "labour_payment" || !txn.partyId) continue;
    if (!labourParties.has(txn.partyId)) continue;
    totals.set(txn.partyId, (totals.get(txn.partyId) ?? 0) + txn.amount);
  }

  return [...totals.entries()]
    .map(([partyId, amount]) => ({
      id: partyId,
      label: labourParties.get(partyId)!.name,
      amount,
      href: `/parties/${partyId}`,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getOutstandingLabourDues(
  projectParties: ProjectParty[],
  parties: Party[],
  transactions: Transaction[],
  limit = 5
): RankedItem[] {
  const summaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "labour"
  );

  const byParty = new Map<string, number>();
  for (const { projectParty, dueAmount } of summaries) {
    if (dueAmount === null || dueAmount <= 0) continue;
    byParty.set(
      projectParty.partyId,
      (byParty.get(projectParty.partyId) ?? 0) + dueAmount
    );
  }

  return [...byParty.entries()]
    .map(([partyId, amount]) => {
      const party = parties.find((p) => p.id === partyId);
      return {
        id: partyId,
        label: party?.name ?? "Labour",
        amount,
        href: `/parties/${partyId}`,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getSkillCostDistribution(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): RankedItem[] {
  const assignmentKey = (projectId: string, partyId: string) =>
    `${projectId}:${partyId}`;
  const skillByAssignment = new Map<string, string>();

  for (const pp of projectParties.filter((p) => p.type === "labour")) {
    skillByAssignment.set(
      assignmentKey(pp.projectId, pp.partyId),
      pp.skillUsed ?? "Labour"
    );
  }

  const totals = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.transactionType !== "labour_payment" || !txn.partyId) continue;
    const skill =
      skillByAssignment.get(assignmentKey(txn.projectId, txn.partyId)) ??
      "Labour";
    totals.set(skill, (totals.get(skill) ?? 0) + txn.amount);
  }

  return [...totals.entries()]
    .map(([label, amount]) => ({ id: label, label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTopVendorsBySpend(
  parties: Party[],
  transactions: Transaction[],
  limit = 5
): RankedItem[] {
  const vendorParties = new Map(
    parties.filter((p) => p.partyType === "material").map((p) => [p.id, p])
  );
  const totals = new Map<string, number>();

  for (const txn of transactions) {
    if (txn.transactionType !== "material_payment" || !txn.partyId) continue;
    if (!vendorParties.has(txn.partyId)) continue;
    totals.set(txn.partyId, (totals.get(txn.partyId) ?? 0) + txn.amount);
  }

  return [...totals.entries()]
    .map(([partyId, amount]) => ({
      id: partyId,
      label: vendorParties.get(partyId)!.name,
      amount,
      href: `/parties/${partyId}`,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getOutstandingVendorDues(
  projectParties: ProjectParty[],
  parties: Party[],
  transactions: Transaction[],
  limit = 5
): RankedItem[] {
  const summaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "material"
  );

  const byParty = new Map<string, number>();
  for (const { projectParty, dueAmount } of summaries) {
    if (dueAmount === null || dueAmount <= 0) continue;
    byParty.set(
      projectParty.partyId,
      (byParty.get(projectParty.partyId) ?? 0) + dueAmount
    );
  }

  return [...byParty.entries()]
    .map(([partyId, amount]) => {
      const party = parties.find((p) => p.id === partyId);
      return {
        id: partyId,
        label: party?.name ?? "Vendor",
        amount,
        href: `/parties/${partyId}`,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getMaterialCategorySpend(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): RankedItem[] {
  const assignmentKey = (projectId: string, partyId: string) =>
    `${projectId}:${partyId}`;
  const categoryByAssignment = new Map<string, string>();

  for (const pp of projectParties.filter((p) => p.type === "material")) {
    categoryByAssignment.set(
      assignmentKey(pp.projectId, pp.partyId),
      pp.categoryUsed ?? "Material"
    );
  }

  const totals = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.transactionType !== "material_payment" || !txn.partyId) continue;
    const category =
      categoryByAssignment.get(assignmentKey(txn.projectId, txn.partyId)) ??
      "Material";
    totals.set(category, (totals.get(category) ?? 0) + txn.amount);
  }

  return [...totals.entries()]
    .map(([label, amount]) => ({ id: label, label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTopClients(projects: Project[], limit = 5): RankedItem[] {
  return projects
    .filter((p) => p.status === "active")
    .map((p) => ({
      id: p.id,
      label: p.name,
      amount: p.contractAmount,
      href: `/projects/${p.id}`,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getOverdueCollections(
  projects: Project[],
  projectParties: ProjectParty[],
  transactions: Transaction[],
  limit = 5
): RankedItem[] {
  return projects
    .filter((p) => p.status === "active")
    .map((project) => {
      const pp = projectParties.filter((x) => x.projectId === project.id);
      const txns = transactions.filter((t) => t.projectId === project.id);
      const summary = getProjectSummary(project, pp, txns);
      return {
        id: project.id,
        label: project.name,
        amount: summary.clientDue ?? 0,
        href: `/projects/${project.id}`,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export { CHART_COLORS };
