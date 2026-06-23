"use client";

import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { createTransaction } from "@/lib/firestore/transactions";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickySave } from "@/components/ui/sticky-save";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_TYPES, getTransactionTypeLabel } from "@/constants";
import { toDateInputValue } from "@/lib/format";
import {
  parseOptionalAmount,
  resolveProjectIdForSave,
} from "@/lib/forms/defaults";
import { ensurePartyAssignedForTransaction } from "@/lib/forms/ensure-party-assignment";
import { TransactionPartySelect } from "@/components/forms/transaction-party-select";
import { toast } from "sonner";
import type { TransactionType, Project, Party } from "@/types";
import { cn } from "@/lib/utils";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";

interface TransactionFormProps {
  projects?: Project[];
  parties?: Party[];
  defaultProjectId?: string;
  defaultType?: TransactionType;
  onSuccess?: () => void;
}

const fieldClass = "h-12 rounded-2xl border-border bg-card shadow-card";

export function TransactionForm({
  projects: projectsProp,
  parties: partiesProp,
  defaultProjectId,
  defaultType,
  onSuccess,
}: TransactionFormProps) {
  const { user } = useAuth();
  const { projects: cachedProjects, parties: cachedParties, projectParties, refresh } =
    useUserData();
  const { runGuarded, lock } = useSubmitGuard();
  const formRef = useRef<HTMLFormElement>(null);
  const prevProjectIdRef = useRef(defaultProjectId ?? "");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(
    projectsProp ?? cachedProjects
  );
  const [parties, setParties] = useState<Party[]>(partiesProp ?? cachedParties);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [transactionType, setTransactionType] = useState<TransactionType>(
    defaultType ?? "client_payment"
  );
  const [partyId, setPartyId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toDateInputValue());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (projectsProp) setProjects(projectsProp);
    else setProjects(cachedProjects);
  }, [projectsProp, cachedProjects]);

  useEffect(() => {
    if (partiesProp) setParties(partiesProp);
    else setParties(cachedParties);
  }, [partiesProp, cachedParties]);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    if (defaultType) setTransactionType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    if (prevProjectIdRef.current !== projectId) {
      setPartyId("");
      prevProjectIdRef.current = projectId;
    }
  }, [projectId]);

  const needsParty =
    transactionType === "labour_payment" ||
    transactionType === "material_payment";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in again");
      return;
    }
    if (loading) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        const resolvedProjectId = await resolveProjectIdForSave(
          user.uid,
          projectId,
          projects,
          refresh
        );
        const wasAssigned =
          needsParty && partyId
            ? await ensurePartyAssignedForTransaction(
                user.uid,
                resolvedProjectId,
                partyId,
                transactionType,
                parties,
                projectParties
              )
            : false;
        await createTransaction(user.uid, {
          projectId: resolvedProjectId,
          partyId: needsParty && partyId ? partyId : undefined,
          transactionType,
          amount: parseOptionalAmount(amount),
          date: date || toDateInputValue(),
          note: note.trim() || undefined,
        });
        await refresh();
        toast.success(
          wasAssigned
            ? "Party assigned and transaction recorded"
            : "Transaction recorded"
        );
        lock();
        onSuccess?.();
      } catch (error) {
        toast.error(getFirestoreErrorMessage(error));
        setLoading(false);
      }
    });
  };

  return (
    <>
      <form
        ref={formRef}
        id="transaction-form"
        onSubmit={handleSubmit}
        className="space-y-4 pb-[calc(10rem+env(safe-area-inset-bottom,0px))] md:pb-32"
      >
        {defaultProjectId && (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-sm text-subtext">Project</p>
            <p className="mt-1 font-semibold leading-tight">
              {projects.find((p) => p.id === projectId)?.name ?? "Selected project"}
            </p>
          </div>
        )}
        {!defaultProjectId && (
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(v) => setProjectId(v ?? "")}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select project">
                  {projects.find((p) => p.id === projectId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={transactionType}
            onValueChange={(v) => {
              setTransactionType(v as TransactionType);
              setPartyId("");
            }}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Select type">
                {getTransactionTypeLabel(transactionType)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {needsParty ? (
          <TransactionPartySelect
            projectId={projectId}
            transactionType={transactionType}
            partyId={partyId}
            onPartyIdChange={setPartyId}
            parties={parties}
            projectParties={projectParties}
          />
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <AmountInput
            id="amount"
            className={cn(fieldClass, "text-lg font-semibold")}
            value={amount}
            onValueChange={setAmount}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            className={fieldClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            placeholder="Note"
            className="rounded-2xl border-border bg-card shadow-card"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Receipt</Label>
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-subtext">
            <Upload className="h-6 w-6" />
            <span className="text-sm">Tap to upload receipt</span>
            <input type="file" accept="image/*" className="sr-only" />
          </label>
        </div>
      </form>
      <StickySave form="transaction-form" loading={loading} label="Save" />
    </>
  );
}
