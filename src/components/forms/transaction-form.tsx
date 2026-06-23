"use client";

import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { createTransaction } from "@/lib/firestore/transactions";
import { getProjects } from "@/lib/firestore/projects";
import { getParties } from "@/lib/firestore/parties";
import { Input } from "@/components/ui/input";
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
import { TRANSACTION_TYPES } from "@/constants";
import { toDateInputValue } from "@/lib/format";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(projectsProp ?? []);
  const [parties, setParties] = useState<Party[]>(partiesProp ?? []);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [transactionType, setTransactionType] = useState<TransactionType>(
    defaultType ?? "client_payment"
  );
  const [partyId, setPartyId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toDateInputValue());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user || (projectsProp && partiesProp)) return;
    Promise.all([getProjects(user.uid), getParties(user.uid)]).then(
      ([p, pts]) => {
        setProjects(p);
        setParties(pts);
      }
    );
  }, [user, projectsProp, partiesProp]);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    if (defaultType) setTransactionType(defaultType);
  }, [defaultType]);

  const needsParty =
    transactionType === "labour_payment" ||
    transactionType === "material_payment";

  const filteredParties = parties.filter((p) => {
    if (transactionType === "labour_payment") return p.partyType === "labour";
    if (transactionType === "material_payment") return p.partyType === "material";
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in again");
      return;
    }
    if (!projectId) {
      toast.error("Select a project");
      return;
    }
    if (needsParty && !partyId) {
      toast.error("Select a party for this payment");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      await createTransaction(user.uid, {
        projectId,
        partyId: needsParty ? partyId : undefined,
        transactionType,
        amount: parsedAmount,
        date,
        note: note.trim() || undefined,
      });
      toast.success("Transaction recorded");
      onSuccess?.();
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        ref={formRef}
        id="transaction-form"
        onSubmit={handleSubmit}
        className="space-y-4 pb-32"
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
              required
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select project" />
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
              <SelectValue />
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
        {needsParty && (
          <div className="space-y-2">
            <Label>Party</Label>
            <Select
              value={partyId}
              onValueChange={(v) => setPartyId(v ?? "")}
              required
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select party" />
              </SelectTrigger>
              <SelectContent>
                {filteredParties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            inputMode="numeric"
            className={cn(fieldClass, "text-lg font-semibold")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={1}
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            placeholder="Optional note"
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
      <StickySave
        type="button"
        loading={loading}
        label="Save"
        onClick={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
