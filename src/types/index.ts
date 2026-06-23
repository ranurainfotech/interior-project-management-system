export type ProjectStatus = "active" | "completed" | "on_hold";

export type PartyType = "labour" | "material";

export type TransactionType =
  | "client_payment"
  | "labour_payment"
  | "material_payment"
  | "expense";

export interface SoftDeletable {
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Project extends SoftDeletable {
  id: string;
  userId: string;
  name: string;
  /** Optional client estimate — update as scope changes */
  contractAmount: number;
  status: ProjectStatus;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectContact extends SoftDeletable {
  id: string;
  userId: string;
  projectId: string;
  name: string;
  phone: string;
  notes?: string;
}

export interface Party extends SoftDeletable {
  id: string;
  userId: string;
  partyType: PartyType;
  name: string;
  phone?: string;
  skills?: string[];
  categories?: string[];
}

export interface ProjectParty extends SoftDeletable {
  id: string;
  userId: string;
  projectId: string;
  partyId: string;
  type: PartyType;
  skillUsed?: string;
  categoryUsed?: string;
  /** Optional budget estimate for this assignment */
  agreedAmount: number;
}

export interface Transaction extends SoftDeletable {
  id: string;
  userId: string;
  projectId: string;
  partyId?: string;
  transactionType: TransactionType;
  amount: number;
  date: string;
  note?: string;
  attachmentUrl?: string;
}

export interface ProjectSummary {
  clientDue: number | null;
  clientOverpaid: number;
  labourDue: number;
  vendorDue: number;
  labourOverpaid: number;
  vendorOverpaid: number;
  budgetRemaining: number;
  totalExpenses: number;
  paidOut: number;
  clientReceived: number;
  profit: number;
  hasClientEstimate: boolean;
}

export interface PartyAssignmentSummary {
  projectParty: ProjectParty;
  party: Party;
  paidAmount: number;
  dueAmount: number | null;
  overpaidAmount: number;
  hasBudget: boolean;
}

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalProjects: number;
  /** Client payments received (active projects) */
  totalCollected: number;
  /** Labour + material + other expenses (active projects) */
  totalPaidOut: number;
  /** Collected minus paid out */
  netCash: number;
  /** Estimate-based pending from clients (only where estimate set) */
  totalReceivable: number;
  /** Budget remaining for labour + material (only where budget set) */
  totalPayable: number;
  labourDue: number;
  vendorDue: number;
  clientOverpaid: number;
  labourOverpaid: number;
  vendorOverpaid: number;
  totalOverpaid: number;
  hasEstimates: boolean;
  /** @deprecated Use netCash */
  netPosition: number;
  /** @deprecated Use totalCollected */
  totalRevenue: number;
  totalExpenses: number;
  labourPaid: number;
  materialPaid: number;
  otherExpenses: number;
  netProfit: number;
  totalContractValue: number;
  collectionRate: number;
}

export interface PartyWithStats extends Party {
  totalDue: number;
  totalPaid: number;
  totalOverpaid: number;
  projectCount: number;
}

export interface ProjectWithSummary extends Project {
  clientDue: number | null;
  profit: number;
  paidOut: number;
}
