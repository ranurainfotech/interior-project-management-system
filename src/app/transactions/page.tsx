"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getTransactions } from "@/lib/firestore/transactions";
import { getProjects } from "@/lib/firestore/projects";
import { getParties } from "@/lib/firestore/parties";
import { formatCurrency } from "@/lib/format";
import { TRANSACTION_TYPES } from "@/constants";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { PageLoading } from "@/components/layout/page-loading";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { FilterChips } from "@/components/ui/filter-chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import type { Transaction, Project, Party, TransactionType } from "@/types";

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

function TransactionsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("projectId") ?? "all";

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [filterProject, setFilterProject] = useState(defaultProjectId);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [txns, projs, pts] = await Promise.all([
        getTransactions(user.uid),
        getProjects(user.uid),
        getParties(user.uid),
      ]);
      setTransactions(txns);
      setProjects(projs);
      setParties(pts);
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const partyMap = new Map(parties.map((p) => [p.id, p]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

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
    subtitle: [
      projectMap.get(txn.projectId)?.name,
      txn.note,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  if (loading) return <PageLoading fullScreen />;

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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<PageLoading fullScreen />}>
      <TransactionsContent />
    </Suspense>
  );
}
