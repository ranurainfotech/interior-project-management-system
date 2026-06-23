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
import { getProject, updateProject, softDeleteProject } from "@/lib/firestore/projects";
import { getProjectContacts } from "@/lib/firestore/contacts";
import { getProjectParties, softDeleteProjectParty } from "@/lib/firestore/project-parties";
import { getProjectTransactions } from "@/lib/firestore/transactions";
import { getParties } from "@/lib/firestore/parties";
import { getProjectSummary, getAssignmentSummaries, getAssignmentTransactions } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody, SectionTitle } from "@/components/layout/section";
import { PageLoading } from "@/components/layout/page-loading";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { AssignmentTransactionsSheet } from "@/components/cards/assignment-transactions-sheet";
import { Avatar } from "@/components/ui/avatar";
import { SwipeRow } from "@/components/ui/swipe-row";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { AssignPartyDialog } from "@/components/forms/assign-party-dialog";
import { ContactDialog } from "@/components/forms/contact-dialog";
import { ProjectAnalytics } from "@/components/analytics/project-analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import { layout, typo } from "@/lib/design";
import type { Project, ProjectContact, ProjectParty, Transaction, Party } from "@/types";

type ProjectDetailTab = "overview" | "contacts" | "labour" | "material";

type SelectedAssignment = {
  type: "labour" | "material";
  partyId: string;
  partyName: string;
  roleLabel: string;
  agreedAmount: number;
  paidAmount: number;
  dueAmount: number;
};

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
    if (!project || !confirm("Delete this project?")) return;
    try {
      await softDeleteProject(project.id);
      toast.success("Project deleted");
      router.push("/projects");
    } catch {
      toast.error("Failed to delete");
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
  const partyMap = new Map(parties.map((p) => [p.id, p]));

  const visibleLabour = showAllLabour
    ? labourSummaries
    : labourSummaries.slice(0, 5);
  const visibleMaterial = showAllMaterial
    ? vendorSummaries
    : vendorSummaries.slice(0, 5);

  const timelineItems: TimelineItem[] = transactions.map((txn) => {
    let title = formatCurrency(txn.amount);
    if (txn.transactionType === "client_payment")
      title = `Received ${formatCurrency(txn.amount)} from Client`;
    else if (txn.transactionType === "expense")
      title = `Expense ${formatCurrency(txn.amount)}`;
    else if (txn.partyId)
      title = `Paid ${formatCurrency(txn.amount)} to ${partyMap.get(txn.partyId)?.name ?? "party"}`;
    return { id: txn.id, date: txn.date, title, subtitle: txn.note };
  });

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
        <DropdownMenuItem
          onClick={async () => {
            await updateProject(project.id, { status: "on_hold" });
            toast.success("Project archived");
            loadData();
          }}
        >
          Archive project
        </DropdownMenuItem>
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
    summary: {
      projectParty: ProjectParty;
      party: Party;
      paidAmount: number;
      dueAmount: number;
    }
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
                <div className="grid min-h-[200px] grid-cols-2 gap-x-4 gap-y-6 rounded-[24px] bg-card p-5 shadow-card sm:grid-cols-4 sm:gap-y-4">
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Contract Amount</p>
                    <p className={`mt-2 ${layout.valueLg}`}>
                      {formatCurrency(project.contractAmount)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Received</p>
                    <p className="mt-2 text-xl font-bold tabular-nums leading-tight text-success">
                      {formatCurrency(summary.clientReceived)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Client Due</p>
                    <p className="mt-2 text-xl font-bold tabular-nums leading-tight text-warning">
                      {formatCurrency(summary.clientDue)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={layout.label}>Profit</p>
                    <p
                      className={`mt-2 text-xl font-bold tabular-nums leading-tight ${
                        summary.profit >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatCurrency(summary.profit)}
                    </p>
                  </div>
                </div>

                <ProjectAnalytics
                  project={project}
                  projectParties={projectParties}
                  parties={parties}
                  transactions={transactions}
                  received={summary.clientReceived}
                  pending={summary.clientDue}
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
                  <Timeline items={timelineItems} emptyMessage="No transactions yet" />
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
                      No labour on this project yet. Assign an existing labour party
                      and set the agreed amount.
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
                        onEdit={() => toast.info("Edit assignment from party detail")}
                        onDelete={async () => {
                          await softDeleteProjectParty(summary.projectParty.id);
                          loadData();
                        }}
                      >
                        <Avatar name={summary.party.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold leading-tight">
                            {summary.party.name}
                          </p>
                          <p className={typo("caption")}>
                            {summary.projectParty.skillUsed ?? "Labour"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-sm leading-snug">
                            <span className="text-subtext">Due </span>
                            <span className="font-semibold text-warning tabular-nums">
                              {formatCurrency(summary.dueAmount)}
                            </span>
                            <span className="mx-2 text-subtext">·</span>
                            <span className="text-subtext">Paid </span>
                            <span className="font-semibold text-success tabular-nums">
                              {formatCurrency(summary.paidAmount)}
                            </span>
                          </div>
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
                      No vendors on this project yet. Assign an existing material
                      vendor and set the agreed amount.
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
                        onEdit={() => toast.info("Edit assignment from party detail")}
                        onDelete={async () => {
                          await softDeleteProjectParty(summary.projectParty.id);
                          loadData();
                        }}
                      >
                        <Avatar name={summary.party.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold leading-tight">
                            {summary.party.name}
                          </p>
                          <p className={typo("caption")}>
                            {summary.projectParty.categoryUsed ?? "Material"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-sm leading-snug">
                            <span className="text-subtext">Due </span>
                            <span className="font-semibold text-warning tabular-nums">
                              {formatCurrency(summary.dueAmount)}
                            </span>
                            <span className="mx-2 text-subtext">·</span>
                            <span className="text-subtext">Paid </span>
                            <span className="font-semibold text-success tabular-nums">
                              {formatCurrency(summary.paidAmount)}
                            </span>
                          </div>
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
        dueAmount={selectedAssignment?.dueAmount ?? 0}
        transactions={selectedAssignmentTransactions}
        assignmentType={selectedAssignment?.type ?? "labour"}
      />
    </AppScreen>
  );
}
