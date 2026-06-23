"use client";

import { useState, useEffect, useRef } from "react";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import {
  updateTransaction,
  softDeleteTransaction,
} from "@/lib/firestore/transactions";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { formatAmountInputValue } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import type { Transaction, TransactionType } from "@/types";
import {
  FormDialogFooter,
  FormField,
  FormStack,
  formInputClass,
  formSelectTriggerClass,
  formTextareaClass,
} from "./form-layout";

interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export function EditTransactionForm({
  transaction,
  onSuccess,
  onDelete,
}: EditTransactionFormProps) {
  const { projects, parties, projectParties, refresh } = useUserData();
  const { runGuarded } = useSubmitGuard();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [projectId, setProjectId] = useState(transaction.projectId);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction.transactionType
  );
  const [partyId, setPartyId] = useState(transaction.partyId ?? "");
  const [amount, setAmount] = useState(formatAmountInputValue(transaction.amount));
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note ?? "");
  const prevProjectIdRef = useRef(transaction.projectId);

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
    if (loading || deleting) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        const resolvedProjectId = await resolveProjectIdForSave(
          transaction.userId,
          projectId,
          projects,
          refresh
        );
        const wasAssigned =
          needsParty && partyId
            ? await ensurePartyAssignedForTransaction(
                transaction.userId,
                resolvedProjectId,
                partyId,
                transactionType,
                parties,
                projectParties
              )
            : false;
        await updateTransaction(transaction.id, {
          projectId: resolvedProjectId,
          transactionType,
          amount: parseOptionalAmount(amount),
          date: date || transaction.date || toDateInputValue(),
          note: note.trim() || null,
          partyId: needsParty ? partyId || null : null,
        });
        await refresh();
        toast.success(
          wasAssigned
            ? "Party assigned and transaction updated"
            : "Transaction updated"
        );
        onSuccess?.();
      } catch (error) {
        toast.error(getFirestoreErrorMessage(error));
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDelete = async () => {
    if (loading || deleting) return;
    if (!window.confirm("Delete this transaction?")) return;

    await runGuarded(async () => {
      setDeleting(true);
      try {
        await softDeleteTransaction(transaction.id);
        await refresh();
        toast.success("Transaction deleted");
        onDelete?.();
      } catch (error) {
        toast.error(getFirestoreErrorMessage(error));
      } finally {
        setDeleting(false);
      }
    });
  };

  const busy = loading || deleting;

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField label="Project">
          <Select
            value={projectId}
            onValueChange={(v) => setProjectId(v ?? "")}
          >
            <SelectTrigger className={formSelectTriggerClass}>
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
        </FormField>
        <FormField label="Type">
          <Select
            value={transactionType}
            onValueChange={(v) => {
              setTransactionType(v as TransactionType);
              setPartyId("");
            }}
          >
            <SelectTrigger className={formSelectTriggerClass}>
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
        </FormField>
        {needsParty ? (
          <TransactionPartySelect
            projectId={projectId}
            transactionType={transactionType}
            partyId={partyId}
            onPartyIdChange={setPartyId}
            parties={parties}
            projectParties={projectParties}
            triggerClassName={formSelectTriggerClass}
          />
        ) : null}
        <FormField label="Amount" htmlFor="edit-txn-amount">
          <AmountInput
            id="edit-txn-amount"
            className={formInputClass}
            placeholder="0"
            value={amount}
            onValueChange={setAmount}
          />
        </FormField>
        <FormField label="Date" htmlFor="edit-txn-date">
          <Input
            id="edit-txn-date"
            type="date"
            className={formInputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
        <FormField label="Note" htmlFor="edit-txn-note">
          <Textarea
            id="edit-txn-note"
            className={formTextareaClass}
            placeholder="Note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormField>
        <Button
          type="button"
          variant="destructive"
          className="h-11 w-full rounded-xl"
          disabled={busy}
          onClick={() => void handleDelete()}
        >
          {deleting ? "Deleting..." : "Delete transaction"}
        </Button>
      </FormStack>
      <FormDialogFooter
        label="Save changes"
        loading={loading}
        loadingLabel="Saving..."
        cancelLabel="Cancel"
      />
    </form>
  );
}
