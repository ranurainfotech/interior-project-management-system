"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  MoreHorizontal,
  Phone,
  MessageCircle,
  IndianRupee,
  Users,
  Package,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { getProject, softDeleteProject } from "@/lib/firestore/projects";
import { getProjectContacts } from "@/lib/firestore/contacts";
import { getProjectParties, softDeleteProjectParty } from "@/lib/firestore/project-parties";
import { getProjectTransactions } from "@/lib/firestore/transactions";
import { getParties } from "@/lib/firestore/parties";
import { getProjectSummary, getAssignmentSummaries, getAssignmentTransactions, hasBudget } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody, SectionTitle } from "@/components/layout/section";
import { PageLoading } from "@/components/layout/page-loading";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { AssignmentTransactionsSheet } from "@/components/cards/assignment-transactions-sheet";
import { Avatar } from "@/components/ui/avatar";
import { SwipeRow } from "@/components/ui/swipe-row";
import { TransactionTimeline } from "@/components/cards/transaction-timeline";
import { AssignPartyDialog } from "@/components/forms/assign-party-dialog";
import { ContactDialog } from "@/components/forms/contact-dialog";
import { EditProjectEstimateDialog } from "@/components/forms/edit-project-estimate-dialog";
import { EditProjectStatusDialog } from "@/components/forms/edit-project-status-dialog";
import { ProjectStatusBadge } from "@/components/cards/project-status-badge";
import { EditAssignmentBudgetDialog } from "@/components/forms/edit-assignment-budget-dialog";
import { ProjectAnalytics } from "@/components/analytics/project-analytics";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import { layout, typo } from "@/lib/design";
import type { Project, ProjectContact, ProjectParty, Transaction, Party, PartyAssignmentSummary } from "@/types";

type ProjectDetailTab = "overview" | "contacts" | "labour" | "material";

type SelectedAssignment = {
  type: "labour" | "material";
  partyId: string;
  partyName: string;
  roleLabel: string;
  agreedAmount: number;
  paidAmount: number;
  dueAmount: number | null;
  overpaidAmount: number;
  hasBudget: boolean;
};

function AssignmentAmounts({ summary }: { summary: PartyAssignmentSummary }) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-sm leading-snug">
      <span className="text-subtext">Paid </span>
      <span className="font-semibold tabular-nums text-success">
        {formatCurrency(summary.paidAmount)}
      </span>
      {summary.hasBudget && summary.dueAmount !== null ? (
        <>
          <span className="text-subtext">· Due </span>
          <span className="font-semibold tabular-nums text-warning">
            {formatCurrency(summary.dueAmount)}
          </span>
        </>
      ) : null}
      {summary.overpaidAmount > 0 ? (
        <>
          <span className="text-subtext">· Overpaid </span>
          <span className="font-semibold tabular-nums text-danger">
            {formatCurrency(summary.overpaidAmount)}
          </span>
        </>
      ) : null}
    </div>
  );
}

const tabMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${num}`;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { refresh } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [contacts, setContacts] = useState<ProjectContact[]>([]);
  const [projectParties, setProjectParties] = useState<ProjectParty[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [showAllLabour, setShowAllLabour] = useState(false);
  const [showAllMaterial, setShowAllMaterial] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("overview");
  const [selectedAssignment, setSelectedAssignment] =
    useState<SelectedAssignment | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    try {
      const [proj, cont, pp, txns, allParties] = await Promise.all([
        getProject(id),
        getProjectContacts(user.uid, id),
        getProjectParties(user.uid, id),
        getProjectTransactions(user.uid, id),
        getParties(user.uid),
      ]);
      setProject(proj);
      setContacts(cont);
      setProjectParties(pp);
      setTransactions(txns);
      setParties(allParties);
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!project || !user) return;
    const confirmed = window.confirm(
      `Delete "${project.name}"? Its transactions, contacts, and assignments will also be removed.`
    );
    if (!confirmed) return;
    try {
      await softDeleteProject(user.uid, project.id);
      await refresh();
      toast.success("Project deleted");
      router.push("/projects");
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    }
  };

  if (loading) return <PageLoading fullScreen />;
  if (!project) {
    return (
      <AppScreen header={<AppHeader title="Project" backHref="/projects" />}>
        <p className="py-8 text-center text-subtext">Project not found</p>
      </AppScreen>
    );
  }

  const summary = getProjectSummary(project, projectParties, transactions);
  const labourSummaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "labour"
  );
  const vendorSummaries = getAssignmentSummaries(
    projectParties,
    parties,
    transactions,
    "material"
  );
  const visibleLabour = showAllLabour
    ? labourSummaries
    : labourSummaries.slice(0, 5);
  const visibleMaterial = showAllMaterial
    ? vendorSummaries
    : vendorSummaries.slice(0, 5);

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="flex h-10 w-10 items-center justify-center">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const quickActions = [
    { label: "Add Payment", href: `/transactions/new?projectId=${id}`, icon: IndianRupee },
    { label: "Add Labour", dialog: "labour" as const, icon: Users },
    { label: "Add Material", dialog: "material" as const, icon: Package },
    { label: "Add Expense", href: `/transactions/new?projectId=${id}&type=expense`, icon: Receipt },
  ];

  const selectedAssignmentTransactions = selectedAssignment
    ? getAssignmentTransactions(
        id,
        selectedAssignment.partyId,
        transactions,
        selectedAssignment.type
      )
    : [];

  const openAssignment = (
    type: "labour" | "material",
    summary: PartyAssignmentSummary
  ) => {
    setSelectedAssignment({
      type,
      partyId: summary.projectParty.partyId,
      partyName: summary.party.name,
      roleLabel:
        type === "labour"
          ? (summary.projectParty.skillUsed ?? "Labour")
          : (summary.projectParty.categoryUsed ?? "Material"),
      agreedAmount: summary.projectParty.agreedAmount,
      paidAmount: summary.paidAmount,
      dueAmount: summary.dueAmount,
      overpaidAmount: summary.overpaidAmount,
      hasBudget: summary.hasBudget,
    });
  };

  return (
    <AppScreen
      header={
        <AppHeader title={project.name} backHref="/projects" menu={menu} />
      }
    >
      <PageBody className="gap-4">
        <SlidingTabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "contacts", label: "Contact" },
            { value: "labour", label: "Labour" },
            { value: "material", label: "Material" },
          ]}
        />

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...tabMotion}>
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                <div className="grid min-h-[200px] grid-cols-2 gap-x-4 gap-y-6 rounded-[24px] bg-card p-5 shadow-card sm:grid-cols-3 sm:gap-y-4">
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Received</p>
                    <p className="mt-2 text-xl font-bold tabular-nums leading-tight text-success">
                      {formatCurrency(summary.clientReceived)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Paid out</p>
                    <p className="mt-2 text-xl font-bold tabular-nums leading-tight">
                      {formatCurrency(summary.paidOut)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Net on project</p>
                    <p
                      className={`mt-2 text-xl font-bold tabular-nums leading-tight ${
                        summary.profit >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatCurrency(summary.profit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[24px] bg-card p-5 shadow-card">
                  <div>
                    <p className={layout.label}>Status</p>
                    <div className="mt-2">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>
                  <EditProjectStatusDialog
                    projectId={project.id}
                    currentStatus={project.status}
                    onSuccess={() => {
                      refresh();
                      loadData();
                    }}
                    trigger={
                      <button
                        type="button"
                        className="text-sm font-medium text-primary"
                      >
                        Change
                      </button>
                    }
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-[24px] bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={layout.label}>Client estimate</p>
                      <p className={`mt-2 ${layout.valueLg}`}>
                        {hasBudget(project.contractAmount)
                          ? formatCurrency(project.contractAmount)
                          : "Not set"}
                      </p>
                    </div>
                    <EditProjectEstimateDialog
                      projectId={project.id}
                      currentEstimate={project.contractAmount}
                      onSuccess={() => {
                        refresh();
                        loadData();
                      }}
                      trigger={
                        <button
                          type="button"
                          className="text-sm font-medium text-primary"
                        >
                          Edit
                        </button>
                      }
                    />
                  </div>
                  {summary.hasClientEstimate ? (
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div>
                        <p className={layout.label}>Client pending</p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-warning">
                          {summary.clientDue !== null
                            ? formatCurrency(summary.clientDue)
                            : "—"}
                        </p>
                      </div>
                      {summary.clientOverpaid > 0 ? (
                        <div>
                          <p className={layout.label}>Client overpaid</p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-danger">
                            {formatCurrency(summary.clientOverpaid)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className={`border-t border-border pt-4 ${typo("caption")}`}>
                      Add an estimate when you know the scope. Payments are always
                      tracked from transactions.
                    </p>
                  )}
                </div>

                <ProjectAnalytics
                  project={project}
                  projectParties={projectParties}
                  parties={parties}
                  transactions={transactions}
                  received={summary.clientReceived}
                  pending={summary.clientDue}
                  clientOverpaid={summary.clientOverpaid}
                  hasClientEstimate={summary.hasClientEstimate}
                />

                <section className="flex flex-col gap-4">
                  <SectionTitle>Quick Actions</SectionTitle>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickActions.map(({ label, href, dialog, icon: Icon }) =>
                      dialog ? (
                        <AssignPartyDialog
                          key={label}
                          projectId={id}
                          type={dialog}
                          parties={parties}
                          onSuccess={loadData}
                          trigger={
                            <button
                              type="button"
                              className="flex h-16 w-full flex-col items-center justify-center gap-1.5 rounded-[20px] bg-card text-sm font-medium leading-tight shadow-card"
                            >
                              <Icon className="h-5 w-5 shrink-0 text-primary" />
                              <span className="text-center">{label}</span>
                            </button>
                          }
                        />
                      ) : (
                        <Link
                          key={label}
                          href={href!}
                          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-[20px] bg-card text-sm font-medium leading-tight shadow-card"
                        >
                          <Icon className="h-5 w-5 shrink-0 text-primary" />
                          <span className="text-center">{label}</span>
                        </Link>
                      )
                    )}
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <SectionTitle>Transactions</SectionTitle>
                  <TransactionTimeline
                    transactions={transactions}
                    parties={parties}
                    projects={[project]}
                    onUpdated={loadData}
                    subtitleForTransaction={(txn) => txn.note}
                    emptyMessage="No transactions yet"
                  />
                </section>

                <section className="rounded-[24px] border border-danger/25 bg-danger/5 p-4">
                  <p className="text-sm font-semibold text-danger">Delete project</p>
                  <p className={`mt-2 ${typo("caption")}`}>
                    Remove this project and all its transactions, contacts, and
                    labour/material assignments from your records.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    className="mt-4 h-12 w-full rounded-2xl font-semibold"
                    onClick={handleDelete}
                  >
                    Delete project
                  </Button>
                </section>
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <ContactDialog
                    projectId={id}
                    onSuccess={loadData}
                    trigger={
                      <button
                        type="button"
                        className="text-sm font-medium text-primary"
                      >
                        Add contact
                      </button>
                    }
                  />
                </div>
                {contacts.length === 0 ? (
                  <p className="text-sm text-subtext">No contacts</p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((c) => (
                      <div
                        key={c.id}
                        className={`${layout.rowBetween} ${layout.cardSm}`}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight">{c.name}</p>
                          <p className={typo("caption")}>{c.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          {c.phone && (
                            <>
                              <a
                                href={`tel:${c.phone}`}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary"
                              >
                                <Phone className="h-5 w-5" />
                              </a>
                              <a
                                href={whatsappUrl(c.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary"
                              >
                                <MessageCircle className="h-5 w-5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "labour" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-end gap-4">
                  {labourSummaries.length > 5 && !showAllLabour && (
                    <button
                      type="button"
                      onClick={() => setShowAllLabour(true)}
                      className="mr-auto text-sm font-medium text-primary"
                    >
                      View all
                    </button>
                  )}
                  <AssignPartyDialog
                    projectId={id}
                    type="labour"
                    parties={parties}
                    onSuccess={loadData}
                    trigger={
                      <button
                        type="button"
                        className="text-sm font-medium text-primary"
                      >
                        Assign labour
                      </button>
                    }
                  />
                </div>
                {labourSummaries.length === 0 ? (
                  <div
                    className={`${layout.cardSm} flex flex-col items-center gap-3 py-8 text-center`}
                  >
                    <p className="text-sm text-subtext">
                      No labour on this project yet. Assign a labour party and
                      optionally set a budget estimate.
                    </p>
                    <AssignPartyDialog
                      projectId={id}
                      type="labour"
                      parties={parties}
                      onSuccess={loadData}
                      trigger={
                        <button
                          type="button"
                          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                        >
                          Assign labour
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleLabour.map((summary) => (
                      <SwipeRow
                        key={summary.projectParty.id}
                        onClick={() => openAssignment("labour", summary)}
                        onDelete={async () => {
                          await softDeleteProjectParty(summary.projectParty.id);
                          await refresh();
                          loadData();
                        }}
                      >
                        <Avatar name={summary.party.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate font-semibold leading-tight">
                              {summary.party.name}
                            </p>
                            <EditAssignmentBudgetDialog
                              assignmentId={summary.projectParty.id}
                              currentBudget={summary.projectParty.agreedAmount}
                              partyName={summary.party.name}
                              onSuccess={() => {
                                refresh();
                                loadData();
                              }}
                              trigger={
                                <button
                                  type="button"
                                  className="shrink-0 text-xs font-medium text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Budget
                                </button>
                              }
                            />
                          </div>
                          <p className={typo("caption")}>
                            {summary.projectParty.skillUsed ?? "Labour"}
                            {summary.hasBudget
                              ? ` · ${formatCurrency(summary.projectParty.agreedAmount)} budget`
                              : ""}
                          </p>
                          <AssignmentAmounts summary={summary} />
                        </div>
                      </SwipeRow>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "material" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-end gap-4">
                  {vendorSummaries.length > 5 && !showAllMaterial && (
                    <button
                      type="button"
                      onClick={() => setShowAllMaterial(true)}
                      className="mr-auto text-sm font-medium text-primary"
                    >
                      View all
                    </button>
                  )}
                  <AssignPartyDialog
                    projectId={id}
                    type="material"
                    parties={parties}
                    onSuccess={loadData}
                    trigger={
                      <button
                        type="button"
                        className="text-sm font-medium text-primary"
                      >
                        Assign vendor
                      </button>
                    }
                  />
                </div>
                {vendorSummaries.length === 0 ? (
                  <div
                    className={`${layout.cardSm} flex flex-col items-center gap-3 py-8 text-center`}
                  >
                    <p className="text-sm text-subtext">
                      No vendors on this project yet. Assign a material vendor and
                      optionally set a budget estimate.
                    </p>
                    <AssignPartyDialog
                      projectId={id}
                      type="material"
                      parties={parties}
                      onSuccess={loadData}
                      trigger={
                        <button
                          type="button"
                          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                        >
                          Assign vendor
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleMaterial.map((summary) => (
                      <SwipeRow
                        key={summary.projectParty.id}
                        onClick={() => openAssignment("material", summary)}
                        onDelete={async () => {
                          await softDeleteProjectParty(summary.projectParty.id);
                          await refresh();
                          loadData();
                        }}
                      >
                        <Avatar name={summary.party.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate font-semibold leading-tight">
                              {summary.party.name}
                            </p>
                            <EditAssignmentBudgetDialog
                              assignmentId={summary.projectParty.id}
                              currentBudget={summary.projectParty.agreedAmount}
                              partyName={summary.party.name}
                              onSuccess={() => {
                                refresh();
                                loadData();
                              }}
                              trigger={
                                <button
                                  type="button"
                                  className="shrink-0 text-xs font-medium text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Budget
                                </button>
                              }
                            />
                          </div>
                          <p className={typo("caption")}>
                            {summary.projectParty.categoryUsed ?? "Material"}
                            {summary.hasBudget
                              ? ` · ${formatCurrency(summary.projectParty.agreedAmount)} budget`
                              : ""}
                          </p>
                          <AssignmentAmounts summary={summary} />
                        </div>
                      </SwipeRow>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </PageBody>

      <AssignmentTransactionsSheet
        open={selectedAssignment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAssignment(null);
        }}
        partyName={selectedAssignment?.partyName ?? ""}
        roleLabel={selectedAssignment?.roleLabel ?? ""}
        agreedAmount={selectedAssignment?.agreedAmount ?? 0}
        paidAmount={selectedAssignment?.paidAmount ?? 0}
        dueAmount={selectedAssignment?.dueAmount ?? null}
        overpaidAmount={selectedAssignment?.overpaidAmount ?? 0}
        hasBudget={selectedAssignment?.hasBudget ?? false}
        transactions={selectedAssignmentTransactions}
        assignmentType={selectedAssignment?.type ?? "labour"}
        parties={parties}
        projects={[project]}
        onUpdated={loadData}
      />
    </AppScreen>
  );
}
