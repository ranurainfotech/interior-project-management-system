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
  clientDue: number;
  labourDue: number;
  vendorDue: number;
  totalExpenses: number;
  clientReceived: number;
  profit: number;
}

export interface PartyAssignmentSummary {
  projectParty: ProjectParty;
  party: Party;
  paidAmount: number;
  dueAmount: number;
}

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalProjects: number;
  totalReceivable: number;
  totalPayable: number;
  labourDue: number;
  vendorDue: number;
  netPosition: number;
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
  projectCount: number;
}

export interface ProjectWithSummary extends Project {
  clientDue: number;
  profit: number;
}


// reploy