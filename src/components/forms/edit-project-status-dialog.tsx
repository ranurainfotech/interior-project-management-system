"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { EditProjectStatusForm } from "./edit-project-status-form";
import type { ProjectStatus } from "@/types";

interface EditProjectStatusDialogProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function EditProjectStatusDialog({
  projectId,
  currentStatus,
  onSuccess,
  trigger,
}: EditProjectStatusDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title="Project status"
      description="Mark whether this project is active, completed, or on hold."
    >
      {({ close }) => (
        <EditProjectStatusForm
          projectId={projectId}
          currentStatus={currentStatus}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
