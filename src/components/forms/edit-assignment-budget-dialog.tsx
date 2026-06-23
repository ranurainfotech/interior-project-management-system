"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { EditAssignmentBudgetForm } from "./edit-assignment-budget-form";

interface EditAssignmentBudgetDialogProps {
  assignmentId: string;
  currentBudget: number;
  partyName: string;
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function EditAssignmentBudgetDialog({
  assignmentId,
  currentBudget,
  partyName,
  onSuccess,
  trigger,
}: EditAssignmentBudgetDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title={`Budget — ${partyName}`}
      description="Current expected cost for this assignment. Optional — payments are the source of truth."
    >
      {({ close }) => (
        <EditAssignmentBudgetForm
          assignmentId={assignmentId}
          currentBudget={currentBudget}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
