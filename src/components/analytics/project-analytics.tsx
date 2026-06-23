"use client";

import type {
  BreakdownSlice,
  MonthlyCashFlow,
  RankedItem,
} from "@/lib/analytics";
import {
  getProjectExpenseBreakdown,
  getProjectLabourBreakdown,
  getProjectMaterialBreakdown,
  getProjectProfitTrend,
  getProjectCollectionPercent,
} from "@/lib/analytics";
import { hasBudget } from "@/lib/calculations";
import type { Party, Project, ProjectParty, Transaction } from "@/types";
import { SectionTitle } from "@/components/layout/section";
import { CollectionProgress } from "./collection-progress";
import { DonutChart } from "./donut-chart";
import { ProfitTrendChart } from "./profit-trend-chart";
import { RankedAmountList } from "./ranked-amount-list";

interface ProjectAnalyticsProps {
  project: Project;
  projectParties: ProjectParty[];
  parties: Party[];
  transactions: Transaction[];
  received: number;
  pending: number | null;
  clientOverpaid?: number;
  hasClientEstimate?: boolean;
}

export function ProjectAnalytics({
  project,
  projectParties,
  parties,
  transactions,
  received,
  pending,
  clientOverpaid = 0,
  hasClientEstimate = false,
}: ProjectAnalyticsProps) {
  const estimateSet = hasClientEstimate && hasBudget(project.contractAmount);
  const collectionPercent = estimateSet
    ? getProjectCollectionPercent(project.contractAmount, transactions)
    : 0;
  const expenseBreakdown: BreakdownSlice[] = getProjectExpenseBreakdown(transactions);
  const labourBreakdown: RankedItem[] = getProjectLabourBreakdown(
    projectParties,
    parties,
    transactions
  );
  const materialBreakdown: RankedItem[] = getProjectMaterialBreakdown(
    projectParties,
    parties,
    transactions
  );
  const profitTrend: MonthlyCashFlow[] = getProjectProfitTrend(transactions);

  return (
    <div className="flex flex-col gap-6">
      <CollectionProgress
        received={received}
        pending={pending}
        contractAmount={project.contractAmount}
        percent={collectionPercent}
        clientOverpaid={clientOverpaid}
        hasClientEstimate={hasClientEstimate}
      />

      <DonutChart slices={expenseBreakdown} title="Expense breakdown" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-[24px] bg-card p-5 shadow-card">
          <SectionTitle>Labour cost breakdown</SectionTitle>
          <RankedAmountList
            items={labourBreakdown}
            emptyMessage="No labour payments yet"
          />
        </section>
        <section className="flex flex-col gap-3 rounded-[24px] bg-card p-5 shadow-card">
          <SectionTitle>Material cost breakdown</SectionTitle>
          <RankedAmountList
            items={materialBreakdown}
            emptyMessage="No material payments yet"
          />
        </section>
      </div>

      <ProfitTrendChart
        data={profitTrend}
        title="Profit trend (cumulative)"
      />
    </div>
  );
}
