"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { assignPartyToProject } from "@/lib/firestore/project-parties";
import { AmountInput } from "@/components/ui/amount-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LABOUR_CATEGORIES, MATERIAL_CATEGORIES } from "@/constants";
import { parseOptionalAmount, resolvePartyIdForAssign } from "@/lib/forms/defaults";
import { toast } from "sonner";
import type { Party, PartyType } from "@/types";
import {
  FormDialogFooter,
  FormField,
  FormStack,
  formInputClass,
  formSelectTriggerClass,
} from "./form-layout";

interface AssignPartyFormProps {
  projectId: string;
  type: PartyType;
  parties: Party[];
  onSuccess?: () => void;
}

export function AssignPartyForm({
  projectId,
  type,
  parties,
  onSuccess,
}: AssignPartyFormProps) {
  const { user } = useAuth();
  const { refresh } = useUserData();
  const { runGuarded } = useSubmitGuard();
  const [loading, setLoading] = useState(false);
  const [partyId, setPartyId] = useState("");
  const [skillOrCategory, setSkillOrCategory] = useState("");
  const [agreedAmount, setAgreedAmount] = useState("");

  const filteredParties = parties.filter((p) => p.partyType === type);
  const categories =
    type === "labour" ? LABOUR_CATEGORIES : MATERIAL_CATEGORIES;
  const selectedParty = filteredParties.find((p) => p.id === partyId);
  const isLabour = type === "labour";
  const partyLabel = isLabour ? "labour" : "vendor";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        const resolvedPartyId = await resolvePartyIdForAssign(
          user.uid,
          partyId,
          type,
          parties,
          refresh
        );
        await assignPartyToProject(user.uid, {
          projectId,
          partyId: resolvedPartyId,
          type,
          ...(isLabour
            ? { skillUsed: skillOrCategory || undefined }
            : { categoryUsed: skillOrCategory || undefined }),
          agreedAmount: parseOptionalAmount(agreedAmount),
        });
        await refresh();
        toast.success(`${isLabour ? "Labour" : "Vendor"} assigned`);
        setPartyId("");
        setSkillOrCategory("");
        setAgreedAmount("");
        onSuccess?.();
      } catch {
        toast.error("Failed to assign party");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField label={isLabour ? "Labour party" : "Vendor"}>
          <Select
            value={partyId}
            onValueChange={(v) => {
              setPartyId(v ?? "");
              setSkillOrCategory("");
            }}
          >
            <SelectTrigger className={formSelectTriggerClass}>
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent>
              {filteredParties.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No parties yet — save to create one
                </SelectItem>
              ) : (
                filteredParties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          label={
            isLabour
              ? "Skill for this project"
              : "Category for this project"
          }
        >
          <Select
            value={skillOrCategory}
            onValueChange={(v) => setSkillOrCategory(v ?? "")}
          >
            <SelectTrigger className={formSelectTriggerClass}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(selectedParty?.skills ??
                selectedParty?.categories ??
                categories
              ).map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          label="Budget estimate"
          htmlFor="agreedAmount"
          hint="Update later when scope changes. Payments are tracked from transactions."
        >
          <AmountInput
            id="agreedAmount"
            className={formInputClass}
            placeholder="80,000"
            value={agreedAmount}
            onValueChange={setAgreedAmount}
          />
        </FormField>
      </FormStack>
      <FormDialogFooter
        label="Assign to project"
        loading={loading}
        loadingLabel="Assigning..."
      />
    </form>
  );
}
