import type {
  Project,
  ProjectParty,
  Transaction,
  ProjectSummary,
  PartyAssignmentSummary,
  DashboardStats,
  Party,
} from "@/types";

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
): number {
  return project.contractAmount - getClientReceived(transactions);
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

export function getLabourDue(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  const labourAssignments = projectParties.filter((pp) => pp.type === "labour");
  return labourAssignments.reduce((total, pp) => {
    const paid = getAssignmentPaidAmount(
      pp.projectId,
      pp.partyId,
      transactions,
      "labour"
    );
    return total + (pp.agreedAmount - paid);
  }, 0);
}

export function getVendorDue(
  projectParties: ProjectParty[],
  transactions: Transaction[]
): number {
  const vendorAssignments = projectParties.filter(
    (pp) => pp.type === "material"
  );
  return vendorAssignments.reduce((total, pp) => {
    const paid = getAssignmentPaidAmount(
      pp.projectId,
      pp.partyId,
      transactions,
      "material"
    );
    return total + (pp.agreedAmount - paid);
  }, 0);
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
  return {
    clientDue: getClientDue(project, transactions),
    labourDue: getLabourDue(projectParties, transactions),
    vendorDue: getVendorDue(projectParties, transactions),
    totalExpenses: getProjectExpenses(transactions),
    clientReceived,
    profit: clientReceived - getProjectExpenses(transactions),
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
      return {
        projectParty: pp,
        party: party!,
        paidAmount,
        dueAmount: pp.agreedAmount - paidAmount,
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
  let totalRevenue = 0;
  let totalExpenses = 0;
  let labourPaid = 0;
  let materialPaid = 0;
  let otherExpenses = 0;
  let netProfit = 0;
  let totalContractValue = 0;

  for (const project of activeProjects) {
    const parties = allProjectParties.filter(
      (pp) => pp.projectId === project.id
    );
    const transactions = allTransactions.filter(
      (t) => t.projectId === project.id
    );
    const summary = getProjectSummary(project, parties, transactions);

    totalContractValue += project.contractAmount;
    totalReceivable += summary.clientDue;
    labourDue += summary.labourDue;
    vendorDue += summary.vendorDue;
    totalPayable += summary.labourDue + summary.vendorDue;
    totalRevenue += summary.clientReceived;
    totalExpenses += summary.totalExpenses;
    labourPaid += sumTransactions(transactions, ["labour_payment"]);
    materialPaid += sumTransactions(transactions, ["material_payment"]);
    otherExpenses += sumTransactions(transactions, ["expense"]);
    netProfit += summary.profit;
  }

  const collectionRate =
    totalContractValue > 0 ? (totalRevenue / totalContractValue) * 100 : 0;

  return {
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    onHoldProjects: onHoldProjects.length,
    totalProjects: projects.length,
    totalReceivable,
    totalPayable,
    labourDue,
    vendorDue,
    netPosition: totalReceivable - totalPayable,
    totalRevenue,
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
): { totalAgreed: number; totalPaid: number; totalDue: number } {
  const assignments = projectParties.filter((pp) => pp.partyId === partyId);
  const totalAgreed = assignments.reduce((sum, pp) => sum + pp.agreedAmount, 0);

  const labourPaid = getPartyPaidAmount(partyId, transactions, "labour_payment");
  const materialPaid = getPartyPaidAmount(
    partyId,
    transactions,
    "material_payment"
  );
  const totalPaid = labourPaid + materialPaid;

  return {
    totalAgreed,
    totalPaid,
    totalDue: totalAgreed - totalPaid,
  };
}
