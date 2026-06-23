export interface RankedItem {
  id: string;
  label: string;
  amount: number;
  subtitle?: string;
  href?: string;
}

export interface MonthlyCashFlow {
  monthKey: string;
  monthLabel: string;
  received: number;
  paid: number;
  net: number;
}

export interface BreakdownSlice {
  label: string;
  amount: number;
  percent: number;
  color: string;
}

export interface ProjectHealthItem {
  projectId: string;
  name: string;
  profit: number;
  clientDue: number | null;
  contractAmount: number;
}
