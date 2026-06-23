"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  findProjectPartyAssignment,
  isPartyAssignedToProject,
  partitionPartiesForProject,
  partyTypeForTransaction,
} from "@/lib/forms/ensure-party-assignment";
import { cn } from "@/lib/utils";
import type { Party, PartyType, ProjectParty, TransactionType } from "@/types";

const fieldClass = "h-12 rounded-2xl border-border bg-card shadow-card";

interface TransactionPartySelectProps {
  projectId: string;
  transactionType: TransactionType;
  partyId: string;
  onPartyIdChange: (partyId: string) => void;
  parties: Party[];
  projectParties: ProjectParty[];
  triggerClassName?: string;
}

function PartyRoleChip({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[9rem] shrink-0 items-center rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium leading-tight text-primary">
      <span className="truncate">{label}</span>
    </span>
  );
}

function PartyOption({
  party,
  assignmentLabel,
}: {
  party: Party;
  assignmentLabel?: string;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="min-w-0 flex-1 truncate">{party.name}</span>
      {assignmentLabel ? <PartyRoleChip label={assignmentLabel} /> : null}
    </span>
  );
}

function getAssignmentLabel(
  projectId: string,
  partyId: string,
  partyType: PartyType,
  projectParties: ProjectParty[]
): string | undefined {
  const assignment = findProjectPartyAssignment(
    projectId,
    partyId,
    partyType,
    projectParties
  );
  return assignment?.skillUsed ?? assignment?.categoryUsed;
}

export function TransactionPartySelect({
  projectId,
  transactionType,
  partyId,
  onPartyIdChange,
  parties,
  projectParties,
  triggerClassName = fieldClass,
}: TransactionPartySelectProps) {
  const partyType = partyTypeForTransaction(transactionType);
  const { onProject, other } = useMemo(() => {
    if (!partyType) return { onProject: [], other: [] };
    return partitionPartiesForProject(
      projectId,
      parties,
      partyType,
      projectParties
    );
  }, [projectId, parties, partyType, projectParties]);

  const selectedOnProject =
    !!projectId &&
    !!partyType &&
    !!partyId &&
    isPartyAssignedToProject(projectId, partyId, partyType, projectParties);

  const selectedParty = parties.find((p) => p.id === partyId);
  const selectedAssignmentLabel =
    projectId && partyType && partyId
      ? getAssignmentLabel(projectId, partyId, partyType, projectParties)
      : undefined;

  if (!partyType) return null;

  return (
    <div className="space-y-2">
      <Label>Party</Label>
      <Select value={partyId} onValueChange={(v) => onPartyIdChange(v ?? "")}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Select party">
            {selectedParty ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{selectedParty.name}</span>
                {selectedAssignmentLabel ? (
                  <PartyRoleChip label={selectedAssignmentLabel} />
                ) : null}
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {projectId && onProject.length > 0 ? (
            <SelectGroup>
              <SelectLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide text-subtext">
                On this project
              </SelectLabel>
              {onProject.map((party) => {
                const assignmentLabel = getAssignmentLabel(
                  projectId,
                  party.id,
                  partyType,
                  projectParties
                );
                return (
                  <SelectItem key={party.id} value={party.id}>
                    <PartyOption
                      party={party}
                      assignmentLabel={assignmentLabel}
                    />
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ) : null}
          {other.length > 0 ? (
            <SelectGroup>
              <SelectLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide text-subtext">
                {projectId ? "Other parties" : "All parties"}
              </SelectLabel>
              {other.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  <PartyOption party={party} />
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null}
          {onProject.length === 0 && other.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              No parties yet
            </SelectItem>
          ) : null}
        </SelectContent>
      </Select>
      {projectId && partyId && !selectedOnProject ? (
        <p className={cn("text-xs leading-relaxed text-subtext")}>
          Not on this project yet — they&apos;ll be assigned when you save.
        </p>
      ) : null}
    </div>
  );
}
