"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { EditTransactionForm } from "./edit-transaction-form";
import type { Transaction } from "@/types";

interface EditTransactionDialogProps {
  transaction: Transaction;
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function EditTransactionDialog({
  transaction,
  onSuccess,
  trigger,
}: EditTransactionDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title="Edit transaction"
      description="Update amount, date, type, or project. Delete if recorded by mistake."
    >
      {({ close }) => (
        <EditTransactionForm
          transaction={transaction}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
          onDelete={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
