"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { getParty, softDeleteParty } from "@/lib/firestore/parties";
import { getPartyProjectHistory } from "@/lib/firestore/project-parties";
import { getPartyTransactions } from "@/lib/firestore/transactions";
import { getProjects } from "@/lib/firestore/projects";
import { getAssignmentPaidAmount, getPartyTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageLoading } from "@/components/layout/page-loading";
import { Avatar } from "@/components/ui/avatar";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${num}`;
}

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { refresh } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState<Awaited<ReturnType<typeof getParty>>>(null);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getPartyProjectHistory>>>([]);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof getPartyTransactions>>>([]);
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof getProjects>>>([]);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    try {
      const [p, h, txns, projs] = await Promise.all([
        getParty(id),
        getPartyProjectHistory(user.uid, id),
        getPartyTransactions(user.uid, id),
        getProjects(user.uid),
      ]);
      setParty(p);
      setHistory(h);
      setTransactions(txns);
      setProjects(projs);
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <PageLoading fullScreen />;
  if (!party) {
    return (
      <AppScreen header={<AppHeader title="Party" backHref="/parties" />}>
        <p className="py-8 text-center text-subtext">Party not found</p>
      </AppScreen>
    );
  }

  const totals = getPartyTotals(id, history, transactions);
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const timelineItems: TimelineItem[] = transactions.map((txn) => ({
    id: txn.id,
    date: txn.date,
    title: formatCurrency(txn.amount),
    subtitle: projectMap.get(txn.projectId)?.name,
  }));

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
          variant="destructive"
          onClick={async () => {
            if (!confirm("Delete this party?")) return;
            await softDeleteParty(id);
            await refresh();
            toast.success("Party deleted");
            router.push("/parties");
          }}
        >
          Delete party
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppScreen
      header={<AppHeader title={party.name} backHref="/parties" menu={menu} />}
    >
      <div className="space-y-8 pb-24">
        <div className="flex flex-col items-center text-center">
          <Avatar name={party.name} size="lg" />
          <p className="mt-4 text-xl font-semibold">{party.name}</p>
          {party.phone && (
            <p className="mt-1 text-sm text-subtext">{party.phone}</p>
          )}
          {party.phone && (
            <div className="mt-4 flex gap-3">
              <a
                href={`tel:${party.phone}`}
                className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-medium text-white"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={whatsappUrl(party.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-6 text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp
              </a>
            </div>
          )}
          <p className="mt-3 text-sm text-subtext">
            {(party.skills ?? party.categories ?? []).join(", ")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-[24px] bg-card p-4 shadow-card">
          <div className="text-center">
            <p className="text-xs text-subtext">Total Assigned</p>
            <p className="mt-1 text-base font-bold tabular-nums">
              {formatCurrency(totals.totalAgreed)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-subtext">Total Paid</p>
            <p className="mt-1 text-base font-bold text-success tabular-nums">
              {formatCurrency(totals.totalPaid)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-subtext">Total Due</p>
            <p className="mt-1 text-base font-bold text-warning tabular-nums">
              {formatCurrency(totals.totalDue)}
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Project History</h2>
          <div className="space-y-3">
            {history.map((pp) => {
              const proj = projectMap.get(pp.projectId);
              const paid = getAssignmentPaidAmount(
                pp.projectId,
                id,
                transactions,
                pp.type
              );
              const due = pp.agreedAmount - paid;
              return (
                <Link key={pp.id} href={`/projects/${pp.projectId}`}>
                  <div className="flex items-center justify-between rounded-[20px] bg-card p-4 shadow-card">
                    <p className="font-semibold">
                      {proj?.name ?? "Project"}
                    </p>
                    <p
                      className={`font-semibold tabular-nums ${
                        due > 0 ? "text-warning" : "text-success"
                      }`}
                    >
                      {due > 0
                        ? `${formatCurrency(due)} Due`
                        : "Fully paid"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
          <Timeline items={timelineItems} />
        </section>
      </div>
    </AppScreen>
  );
}
