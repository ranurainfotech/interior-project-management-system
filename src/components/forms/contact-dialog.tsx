"use client";

import type { ReactElement } from "react";
import { FormDialog } from "./form-dialog";
import { ContactForm } from "./contact-form";

interface ContactDialogProps {
  projectId: string;
  onSuccess?: () => void;
  trigger: ReactElement;
}

export function ContactDialog({
  projectId,
  onSuccess,
  trigger,
}: ContactDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title="Add contact"
      description="Save a site contact for quick call and WhatsApp access."
    >
      {({ close }) => (
        <ContactForm
          projectId={projectId}
          onSuccess={() => {
            close();
            onSuccess?.();
          }}
        />
      )}
    </FormDialog>
  );
}
