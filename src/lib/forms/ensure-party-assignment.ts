import { assignPartyToProject } from "@/lib/firestore/project-parties";
import type { Party, PartyType, ProjectParty, TransactionType } from "@/types";

export function partyTypeForTransaction(
  transactionType: TransactionType
): PartyType | null {
  if (transactionType === "labour_payment") return "labour";
  if (transactionType === "material_payment") return "material";
  return null;
}

export function findProjectPartyAssignment(
  projectId: string,
  partyId: string,
  type: PartyType,
  projectParties: ProjectParty[]
): ProjectParty | undefined {
  return projectParties.find(
    (pp) =>
      pp.projectId === projectId &&
      pp.partyId === partyId &&
      pp.type === type
  );
}

export function isPartyAssignedToProject(
  projectId: string,
  partyId: string,
  type: PartyType,
  projectParties: ProjectParty[]
): boolean {
  return !!findProjectPartyAssignment(projectId, partyId, type, projectParties);
}

export function partitionPartiesForProject(
  projectId: string,
  parties: Party[],
  partyType: PartyType,
  projectParties: ProjectParty[]
): { onProject: Party[]; other: Party[] } {
  const filtered = parties.filter((p) => p.partyType === partyType);
  if (!projectId) {
    return { onProject: [], other: filtered };
  }

  const onProject: Party[] = [];
  const other: Party[] = [];

  for (const party of filtered) {
    if (isPartyAssignedToProject(projectId, party.id, partyType, projectParties)) {
      onProject.push(party);
    } else {
      other.push(party);
    }
  }

  const byName = (a: Party, b: Party) => a.name.localeCompare(b.name);
  onProject.sort(byName);
  other.sort(byName);

  return { onProject, other };
}

/** Assign party to project if missing. Returns true when a new assignment was created. */
export async function ensurePartyAssignedToProject(
  userId: string,
  projectId: string,
  party: Party,
  projectParties: ProjectParty[]
): Promise<boolean> {
  if (
    isPartyAssignedToProject(
      projectId,
      party.id,
      party.partyType,
      projectParties
    )
  ) {
    return false;
  }

  const isLabour = party.partyType === "labour";
  await assignPartyToProject(userId, {
    projectId,
    partyId: party.id,
    type: party.partyType,
    ...(isLabour
      ? { skillUsed: party.skills?.[0] }
      : { categoryUsed: party.categories?.[0] }),
    agreedAmount: 0,
  });
  return true;
}

export async function ensurePartyAssignedForTransaction(
  userId: string,
  projectId: string,
  partyId: string,
  transactionType: TransactionType,
  parties: Party[],
  projectParties: ProjectParty[]
): Promise<boolean> {
  const expectedType = partyTypeForTransaction(transactionType);
  if (!expectedType || !partyId) return false;

  const party = parties.find((p) => p.id === partyId);
  if (!party || party.partyType !== expectedType) return false;

  return ensurePartyAssignedToProject(
    userId,
    projectId,
    party,
    projectParties
  );
}
