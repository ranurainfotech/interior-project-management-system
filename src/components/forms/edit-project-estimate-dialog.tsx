"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { EditProjectEstimateForm } from "./edit-project-estimate-form";

interface EditProjectEstimateDialogProps {
  projectId: string;
  currentEstimate: number;
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function EditProjectEstimateDialog({
  projectId,
  currentEstimate,
  onSuccess,
  trigger,
}: EditProjectEstimateDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title="Client estimate"
      description="Current expected total from the client. Optional — payments are the source of truth."
    >
      {({ close }) => (
        <EditProjectEstimateForm
          projectId={projectId}
          currentEstimate={currentEstimate}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
