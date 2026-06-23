"use client";

import { useState } from "react";
import { updateProject } from "@/lib/firestore/projects";
import { parseOptionalAmount } from "@/lib/forms/defaults";
import { AmountInput } from "@/components/ui/amount-input";
import { formatAmountInputValue } from "@/lib/format";
import { toast } from "sonner";
import {
  FormDialogFooter,
  FormField,
  FormStack,
  formInputClass,
} from "./form-layout";

interface EditProjectEstimateFormProps {
  projectId: string;
  currentEstimate: number;
  onSuccess?: () => void;
}

export function EditProjectEstimateForm({
  projectId,
  currentEstimate,
  onSuccess,
}: EditProjectEstimateFormProps) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(formatAmountInputValue(currentEstimate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProject(projectId, {
        contractAmount: parseOptionalAmount(estimate),
      });
      toast.success("Client estimate updated");
      onSuccess?.();
    } catch {
      toast.error("Failed to update estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField
          label="Client estimate"
          htmlFor="client-estimate"
          hint="Update when scope changes. Cash flow is tracked from payments."
        >
          <AmountInput
            id="client-estimate"
            className={formInputClass}
            placeholder="Leave empty if not set"
            value={estimate}
            onValueChange={setEstimate}
          />
        </FormField>
      </FormStack>
      <FormDialogFooter
        label="Save estimate"
        loading={loading}
        loadingLabel="Saving..."
      />
    </form>
  );
}
