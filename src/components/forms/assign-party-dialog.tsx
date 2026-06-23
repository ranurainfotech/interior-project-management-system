"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { AssignPartyForm } from "./assign-party-form";
import type { Party, PartyType } from "@/types";

interface AssignPartyDialogProps {
  projectId: string;
  type: PartyType;
  parties: Party[];
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function AssignPartyDialog({
  projectId,
  type,
  parties,
  onSuccess,
  trigger,
}: AssignPartyDialogProps) {
  const isLabour = type === "labour";

  return (
    <FormDialog
      trigger={trigger}
      title={isLabour ? "Assign labour" : "Assign vendor"}
      description={
        isLabour
          ? "Link a labour party to this project with skill and agreed amount."
          : "Link a material vendor to this project with category and agreed amount."
      }
    >
      {({ close }) => (
        <AssignPartyForm
          projectId={projectId}
          type={type}
          parties={parties}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
