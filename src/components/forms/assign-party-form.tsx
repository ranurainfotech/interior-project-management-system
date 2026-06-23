"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { assignPartyToProject } from "@/lib/firestore/project-parties";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LABOUR_CATEGORIES, MATERIAL_CATEGORIES } from "@/constants";
import { toast } from "sonner";
import type { Party, PartyType } from "@/types";
import {
  FormDialogFooter,
  FormEmptyState,
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

  if (filteredParties.length === 0) {
    return (
      <div className="px-5 py-5">
        <FormEmptyState
          title={`No ${partyLabel} parties yet`}
          description={`Create a ${partyLabel} in Parties first, then assign them to this project.`}
          action={
            <Link
              href={`/parties/new?type=${type}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white"
            >
              Create {partyLabel} party
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await assignPartyToProject(user.uid, {
        projectId,
        partyId,
        type,
        ...(isLabour
          ? { skillUsed: skillOrCategory }
          : { categoryUsed: skillOrCategory }),
        agreedAmount: Number(agreedAmount),
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField label={isLabour ? "Labour party" : "Vendor"} required>
          <Select
            value={partyId}
            onValueChange={(v) => {
              setPartyId(v ?? "");
              setSkillOrCategory("");
            }}
            required
          >
            <SelectTrigger className={formSelectTriggerClass}>
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent>
              {filteredParties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          label={isLabour ? "Skill for this project" : "Category for this project"}
          required
        >
          <Select
            value={skillOrCategory}
            onValueChange={(v) => setSkillOrCategory(v ?? "")}
            required
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
          label="Agreed amount"
          htmlFor="agreedAmount"
          hint="Total amount agreed for this assignment"
          required
        >
          <Input
            id="agreedAmount"
            type="number"
            className={formInputClass}
            placeholder="80000"
            value={agreedAmount}
            onChange={(e) => setAgreedAmount(e.target.value)}
            required
            min={0}
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
