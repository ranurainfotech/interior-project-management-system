"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserData } from "@/lib/data/user-data-context";
import { getProjectSummary } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { FilterChips } from "@/components/ui/filter-chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { TRANSACTION_TYPES } from "@/constants";
import type { Transaction, Party, TransactionType } from "@/types";

function txnTitle(txn: Transaction, partyMap: Map<string, Party>): string {
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

export default function TransactionsPage() {
  const { projects, parties, transactions } = useUserData();
  const [filterProject, setFilterProject] = useState("all");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilterProject(params.get("projectId") ?? "all");
  }, []);

  const partyMap = useMemo(
    () => new Map(parties.map((p) => [p.id, p])),
    [parties]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const filtered = useMemo(
    () =>
      transactions.filter((txn) => {
        if (filterProject !== "all" && txn.projectId !== filterProject)
          return false;
        if (filterType !== "all" && txn.transactionType !== filterType)
          return false;
        return true;
      }),
    [transactions, filterProject, filterType]
  );

  const timelineItems: TimelineItem[] = filtered.map((txn) => ({
    id: txn.id,
    date: txn.date,
    title: txnTitle(txn, partyMap),
    subtitle: [projectMap.get(txn.projectId)?.name, txn.note]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <AppScreen header={<AppHeader title="Transactions" />}>
      <PageBody className="gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <FilterChips
            className="md:flex-1"
            value={filterType}
            onChange={(v) => setFilterType(v)}
            options={[
              { value: "all", label: "All" },
              ...TRANSACTION_TYPES.map((t) => ({
                value: t.value as TransactionType,
                label: t.label.split(" ")[0],
              })),
            ]}
          />

          <Select
            value={filterProject}
            onValueChange={(v) => setFilterProject(v ?? "all")}
          >
            <SelectTrigger className="h-12 w-full rounded-2xl bg-card shadow-card md:w-64 md:shrink-0">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:mx-auto md:max-w-3xl">
          <Timeline items={timelineItems} emptyMessage="No transactions yet" />
        </div>
      </PageBody>
    </AppScreen>
  );
}
