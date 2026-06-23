import type {
  Project,
  ProjectParty,
  Transaction,
  ProjectSummary,
  PartyAssignmentSummary,
  DashboardStats,
  Party,
} from "@/types";

export function hasBudget(amount: number | undefined | null): boolean {
  return typeof amount === "number" && amount > 0;
}

export function getDueHint(
  budget: number | undefined | null,
  paid: number
): number | null {
  if (!hasBudget(budget)) return null;
  return Math.max(0, budget! - paid);
}

export function getOverpaid(
  budget: number | undefined | null,
  paid: number
): number {
  if (!hasBudget(budget)) return 0;
  return Math.max(0, paid - budget!);
}

export function sumTransactions(
  transactions: Transaction[],
  types: Transaction["transactionType"][]
): number {
  return transactions
    .filter((t) => types.includes(t.transactionType))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getClientReceived(transactions: Transaction[]): number {
  return sumTransactions(transactions, ["client_payment"]);
}

export function getClientDue(
  project: Project,
  transactions: Transaction[]
): number | null {
  if (!hasBudget(project.contractAmount)) return null;
  const due = project.contractAmount - getClientReceived(transactions);
  return Math.max(0, due);
}

export function getClientOverpaid(
  project: Project,
  transactions: Transaction[]
): number {
  if (!hasBudget(project.contractAmount)) return 0;
  const received = getClientReceived(transactions);
  return Math.max(0, received - project.contractAmount);
}

export function getPartyPaidAmount(
  partyId: string,
  transactions: Transaction[],
  type: "labour_payment" | "material_payment"
): number {
  return transactions
    .filter((t) => t.partyId === partyId && t.transactionType === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getAssignmentPaidAmount(
  projectId: string,
  partyId: string,
  transactions: Transaction[],
  type: "labour" | "material"
): number {
  const paymentType =
    type === "labour" ? "labour_payment" : "material_payment";

  return transactions
    .filter(
      (t) =>
        t.projectId === projectId &&
        t.partyId === partyId &&
        t.transactionType === paymentType
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

function sumAssignmentDues(
  projectParties: ProjectParty[],
  transactions: Transaction[],
  type: "labour" | "material"
): { due: number; overpaid: number } {
  const assignments = projectParties.filter((pp) => pp.type === type);
  return assignments.reduce(
    (acc, pp) => {
      const paid = getAssignmentPaidAmount(
        pp.projectId,
        pp.partyId,
        transactions,
        type
      );
      const due = getDueHint(pp.agreedAmount, paid);
      const overpaid = getOverpaid(pp.agreedAmount, paid);
      return {
        due: acc.due + (due ?? 0),
        overpaid: acc.overpaid + overpaid,
      };
    },
    { due: 0, overpaid: 0 }
  );
}

export function getLabourDue(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  return sumAssignmentDues(projectParties, transactions, "labour").due;
}

export function getVendorDue(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  return sumAssignmentDues(projectParties, transactions, "material").due;
}

export function getLabourOverpaid(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  return sumAssignmentDues(projectParties, transactions, "labour").overpaid;
}

export function getVendorOverpaid(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  return sumAssignmentDues(projectParties, transactions, "material").overpaid;
}

export function getProjectExpenses(transactions: Transaction[]): number {
  return sumTransactions(transactions, [
    "labour_payment",
    "material_payment",
    "expense",
  ]);
}

export function getProjectProfit(
  project: Project,
  transactions: Transaction[]
): number {
  const clientReceived = getClientReceived(transactions);
  const expenses = getProjectExpenses(transactions);
  return clientReceived - expenses;
}

export function getProjectSummary(
  project: Project,
  projectParties: ProjectParty[],
  transactions: Transaction[]
): ProjectSummary {
  const clientReceived = getClientReceived(transactions);
  const totalExpenses = getProjectExpenses(transactions);
  const labourDue = getLabourDue(projectParties, transactions);
  const vendorDue = getVendorDue(projectParties, transactions);

  return {
    clientDue: getClientDue(project, transactions),
    clientOverpaid: getClientOverpaid(project, transactions),
    labourDue,
    vendorDue,
    labourOverpaid: getLabourOverpaid(projectParties, transactions),
    vendorOverpaid: getVendorOverpaid(projectParties, transactions),
    budgetRemaining: labourDue + vendorDue,
    totalExpenses,
    paidOut: totalExpenses,
    clientReceived,
    profit: clientReceived - totalExpenses,
    hasClientEstimate: hasBudget(project.contractAmount),
  };
}

export function getAssignmentSummaries(
  projectParties: ProjectParty[],
  parties: Party[],
  transactions: Transaction[],
  type: "labour" | "material"
): PartyAssignmentSummary[] {
  return projectParties
    .filter((pp) => pp.type === type)
    .map((pp) => {
      const party = parties.find((p) => p.id === pp.partyId);
      const paidAmount = getAssignmentPaidAmount(
        pp.projectId,
        pp.partyId,
        transactions,
        type
      );
      const budgetSet = hasBudget(pp.agreedAmount);
      return {
        projectParty: pp,
        party: party!,
        paidAmount,
        dueAmount: getDueHint(pp.agreedAmount, paidAmount),
        overpaidAmount: getOverpaid(pp.agreedAmount, paidAmount),
        hasBudget: budgetSet,
      };
    })
    .filter((s) => s.party);
}

export function getAssignmentTransactions(
  projectId: string,
  partyId: string,
  transactions: Transaction[],
  type: "labour" | "material"
): Transaction[] {
  const paymentType =
    type === "labour" ? "labour_payment" : "material_payment";

  return transactions
    .filter(
      (t) =>
        t.projectId === projectId &&
        t.partyId === partyId &&
        t.transactionType === paymentType
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getDashboardStats(
  projects: Project[],
  allProjectParties: ProjectParty[],
  allTransactions: Transaction[]
): DashboardStats {
  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const onHoldProjects = projects.filter((p) => p.status === "on_hold");

  let totalReceivable = 0;
  let totalPayable = 0;
  let labourDue = 0;
  let vendorDue = 0;
  let clientOverpaid = 0;
  let labourOverpaid = 0;
  let vendorOverpaid = 0;
  let totalCollected = 0;
  let totalExpenses = 0;
  let labourPaid = 0;
  let materialPaid = 0;
  let otherExpenses = 0;
  let netProfit = 0;
  let totalContractValue = 0;
  let hasEstimates = false;

  for (const project of activeProjects) {
    const parties = allProjectParties.filter(
      (pp) => pp.projectId === project.id
    );
    const transactions = allTransactions.filter(
      (t) => t.projectId === project.id
    );
    const summary = getProjectSummary(project, parties, transactions);

    if (summary.hasClientEstimate) {
      hasEstimates = true;
      totalContractValue += project.contractAmount;
      if (summary.clientDue !== null) totalReceivable += summary.clientDue;
    }
    if (parties.some((pp) => hasBudget(pp.agreedAmount))) {
      hasEstimates = true;
    }

    labourDue += summary.labourDue;
    vendorDue += summary.vendorDue;
    totalPayable += summary.budgetRemaining;
    clientOverpaid += summary.clientOverpaid;
    labourOverpaid += summary.labourOverpaid;
    vendorOverpaid += summary.vendorOverpaid;
    totalCollected += summary.clientReceived;
    totalExpenses += summary.totalExpenses;
    labourPaid += sumTransactions(transactions, ["labour_payment"]);
    materialPaid += sumTransactions(transactions, ["material_payment"]);
    otherExpenses += sumTransactions(transactions, ["expense"]);
    netProfit += summary.profit;
  }

  const totalPaidOut = totalExpenses;
  const netCash = totalCollected - totalPaidOut;
  const totalOverpaid = clientOverpaid + labourOverpaid + vendorOverpaid;

  const collectionRate =
    totalContractValue > 0 ? (totalCollected / totalContractValue) * 100 : 0;

  return {
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    onHoldProjects: onHoldProjects.length,
    totalProjects: projects.length,
    totalCollected,
    totalPaidOut,
    netCash,
    totalReceivable,
    totalPayable,
    labourDue,
    vendorDue,
    clientOverpaid,
    labourOverpaid,
    vendorOverpaid,
    totalOverpaid,
    hasEstimates,
    netPosition: netCash,
    totalRevenue: totalCollected,
    totalExpenses,
    labourPaid,
    materialPaid,
    otherExpenses,
    netProfit,
    totalContractValue,
    collectionRate,
  };
}

export function getPartyTotals(
  partyId: string,
  projectParties: ProjectParty[],
  transactions: Transaction[]
): {
  totalBudget: number;
  totalPaid: number;
  totalDue: number;
  totalOverpaid: number;
} {
  const assignments = projectParties.filter((pp) => pp.partyId === partyId);

  let totalDue = 0;
  let totalOverpaid = 0;
  let totalBudget = 0;

  for (const pp of assignments) {
    const type = pp.type === "labour" ? "labour" : "material";
    const paid = getAssignmentPaidAmount(
      pp.projectId,
      pp.partyId,
      transactions,
      type
    );
    if (hasBudget(pp.agreedAmount)) {
      totalBudget += pp.agreedAmount;
      const due = getDueHint(pp.agreedAmount, paid);
      totalDue += due ?? 0;
      totalOverpaid += getOverpaid(pp.agreedAmount, paid);
    }
  }

  const labourPaid = getPartyPaidAmount(partyId, transactions, "labour_payment");
  const materialPaid = getPartyPaidAmount(
    partyId,
    transactions,
    "material_payment"
  );
  const totalPaid = labourPaid + materialPaid;

  return {
    totalBudget,
    totalPaid,
    totalDue,
    totalOverpaid,
  };
}
