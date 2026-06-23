"use client";

import { useState } from "react";
import { updateProjectParty } from "@/lib/firestore/project-parties";
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

interface EditAssignmentBudgetFormProps {
  assignmentId: string;
  currentBudget: number;
  onSuccess?: () => void;
}

export function EditAssignmentBudgetForm({
  assignmentId,
  currentBudget,
  onSuccess,
}: EditAssignmentBudgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(formatAmountInputValue(currentBudget));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProjectParty(assignmentId, {
        agreedAmount: parseOptionalAmount(budget),
      });
      toast.success("Budget updated");
      onSuccess?.();
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField
          label="Budget estimate"
          htmlFor="assignment-budget"
          hint="Update when scope changes for this labour or vendor."
        >
          <AmountInput
            id="assignment-budget"
            className={formInputClass}
            placeholder="Leave empty if not set"
            value={budget}
            onValueChange={setBudget}
          />
        </FormField>
      </FormStack>
      <FormDialogFooter
        label="Save budget"
        loading={loading}
        loadingLabel="Saving..."
      />
    </form>
  );
}
