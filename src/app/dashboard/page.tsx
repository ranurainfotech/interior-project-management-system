"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Users,
  Package,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { getDashboardStats, getProjectSummary } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { MetricCell, PageBody, SectionTitle } from "@/components/layout/section";
import { ProjectSummaryCard } from "@/components/cards/project-summary-card";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { typo } from "@/lib/design";
import type { Party, Project, Transaction } from "@/types";

function greetingName(email?: string | null) {
  if (!email) return "there";
  const part = email.split("@")[0] ?? "there";
  return part
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function txnTitle(
  txn: Transaction,
  partyMap: Map<string, Party>,
  projectMap: Map<string, Project>
): string {
  switch (txn.transactionType) {
    case "client_payment":
      return `Received ${formatCurrency(txn.amount)}`;
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

const quickActions = [
  { label: "Add Payment", href: "/transactions/new", icon: IndianRupee },
  { label: "Add Labour", href: "/parties/new?type=labour", icon: Users },
  { label: "Add Material", href: "/parties/new?type=material", icon: Package },
  { label: "Add Project", href: "/projects/new", icon: FolderPlus },
];

function GradientSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    projects: projs,
    projectParties,
    transactions: txns,
    parties: allParties,
  } = useUserData();

  const stats = useMemo(
    () => getDashboardStats(projs, projectParties, txns),
    [projs, projectParties, txns]
  );

  const projectSummaries = useMemo(
    () =>
      projs
        .filter((p) => p.status === "active")
        .map((project) => {
          const pp = projectParties.filter((x) => x.projectId === project.id);
          const t = txns.filter((x) => x.projectId === project.id);
          const s = getProjectSummary(project, pp, t);
          return { project, clientDue: s.clientDue, profit: s.profit, paidOut: s.paidOut };
        }),
    [projs, projectParties, txns]
  );

  const recentActivity = useMemo(() => {
    const partyMap = new Map(allParties.map((p) => [p.id, p]));
    const projectMap = new Map(projs.map((p) => [p.id, p]));
    return txns.slice(0, 6).map((txn) => ({
      id: txn.id,
      date: txn.date,
      title: txnTitle(txn, partyMap, projectMap),
      subtitle: projectMap.get(txn.projectId)?.name,
    }));
  }, [txns, allParties, projs]);

  const collectionPct = Math.min(100, Math.round(stats.collectionRate));

  return (
    <AppScreen header={<AppHeader title="Dashboard" />}>
      <PageBody>
        <p className={typo("h1")}>
          {timeGreeting()}, {greetingName(user?.email)}
        </p>

        <div className="flex flex-col gap-6 rounded-[24px] bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#1d4ed8] px-4 py-6 text-white shadow-card md:px-8">
          <div className="grid grid-cols-3 gap-2 divide-x divide-white/15 md:gap-6">
            <MetricCell
              light
              size="xl"
              label="Collected"
              value={formatCurrency(stats.totalCollected)}
            />
            <MetricCell
              light
              size="xl"
              label="Paid out"
              value={formatCurrency(stats.totalPaidOut)}
            />
            <MetricCell
              light
              size="xl"
              label="Net cash"
              value={formatCurrency(stats.netCash)}
              valueClassName={
                stats.netCash >= 0 ? "text-white" : "text-red-200"
              }
            />
          </div>

          <div className="h-px bg-white/15" />

          <GradientSection title="Business snapshot">
            <div className="grid grid-cols-2 gap-4 divide-x divide-white/15">
              <div>
                <MetricCell
                  light
                  size="lg"
                  label="Active projects"
                  value={String(stats.activeProjects)}
                />
                <p className="mt-1 text-center text-[11px] text-white/55">
                  {stats.totalProjects} total · {stats.completedProjects}{" "}
                  completed
                </p>
              </div>
              <div>
                <MetricCell
                  light
                  size="lg"
                  label="Total expenses"
                  value={formatCurrency(stats.totalExpenses)}
                />
                <p className="mt-1 text-center text-[11px] text-white/55">
                  Labour, material & other
                </p>
              </div>
            </div>
          </GradientSection>

          {stats.hasEstimates ? (
            <>
              <div className="h-px bg-white/15" />

              <GradientSection title="Estimates">
                <div className="grid grid-cols-3 gap-2 divide-x divide-white/15 md:gap-4">
                  <MetricCell
                    light
                    size="lg"
                    label="Client pending"
                    value={formatCurrency(stats.totalReceivable)}
                    valueClassName="text-amber-200"
                  />
                  <MetricCell
                    light
                    size="lg"
                    label="Budget remaining"
                    value={formatCurrency(stats.totalPayable)}
                    valueClassName="text-amber-200"
                  />
                  <MetricCell
                    light
                    size="lg"
                    label="Overpaid"
                    value={formatCurrency(stats.totalOverpaid)}
                    valueClassName={
                      stats.totalOverpaid > 0 ? "text-red-200" : "text-white"
                    }
                  />
                </div>
              </GradientSection>
            </>
          ) : null}

          <div className="h-px bg-white/15" />

          <GradientSection title="Outstanding">
            <div className="grid grid-cols-2 gap-4 divide-x divide-white/15">
              <MetricCell
                light
                size="lg"
                label="Labour due"
                value={formatCurrency(stats.labourDue)}
                valueClassName="text-amber-200"
              />
              <MetricCell
                light
                size="lg"
                label="Material due"
                value={formatCurrency(stats.vendorDue)}
                valueClassName="text-amber-200"
              />
            </div>
          </GradientSection>

          <div className="h-px bg-white/15" />

          <GradientSection title="Expense breakdown">
            <div className="grid grid-cols-3 gap-2 divide-x divide-white/15 md:gap-4">
              <MetricCell
                light
                size="lg"
                label="Labour paid"
                value={formatCurrency(stats.labourPaid)}
              />
              <MetricCell
                light
                size="lg"
                label="Material paid"
                value={formatCurrency(stats.materialPaid)}
              />
              <MetricCell
                light
                size="lg"
                label="Other expenses"
                value={formatCurrency(stats.otherExpenses)}
              />
            </div>
          </GradientSection>
        </div>

        {stats.totalContractValue > 0 ? (
          <section className="flex flex-col gap-3 rounded-[24px] bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                Against current estimate
              </p>
              <p className="text-sm font-semibold tabular-nums text-primary">
                {collectionPct}%
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${collectionPct}%` }}
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-subtext">
              <span>Collected {formatCurrency(stats.totalCollected)}</span>
              <span>Estimate {formatCurrency(stats.totalContractValue)}</span>
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-4">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-[20px] bg-card px-2 text-sm font-medium leading-tight shadow-card transition-colors hover:bg-muted/40"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-center">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Recent activity</SectionTitle>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[24px] bg-card p-4 shadow-card">
            <Timeline
              items={recentActivity}
              emptyMessage="No transactions yet"
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Active projects</SectionTitle>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {projectSummaries.length === 0 ? (
            <p className={typo("caption")}>No active projects</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projectSummaries.map(({ project, clientDue, profit, paidOut }) => (
                <ProjectSummaryCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  status={project.status}
                  clientEstimate={project.contractAmount}
                  clientDue={clientDue}
                  profit={profit}
                  paidOut={paidOut}
                />
              ))}
            </div>
          )}
        </section>
      </PageBody>
    </AppScreen>
  );
}
