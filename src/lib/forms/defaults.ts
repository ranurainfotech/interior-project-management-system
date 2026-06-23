import { createProject } from "@/lib/firestore/projects";
import { createParty } from "@/lib/firestore/parties";
import { toDateInputValue, parseAmountInput } from "@/lib/format";
import type { Party, PartyType, Project } from "@/types";

const UNASSIGNED_PROJECT_NAME = "Unassigned";

/** Empty or invalid amounts become 0. Accepts comma-formatted input. */
export function parseOptionalAmount(value: string): number {
  return parseAmountInput(value);
}

/** Use selected project, or a single shared "Unassigned" bucket project. */
export async function resolveProjectIdForSave(
  userId: string,
  projectId: string,
  projects: Project[],
  refresh?: () => Promise<void>
): Promise<string> {
  if (projectId) return projectId;

  const existing = projects.find((p) => p.name === UNASSIGNED_PROJECT_NAME);
  if (existing) return existing.id;

  const id = await createProject(userId, {
    name: UNASSIGNED_PROJECT_NAME,
    contractAmount: 0,
    status: "active",
    startDate: toDateInputValue(),
  });
  await refresh?.();
  return id;
}

/** Use selected party, or create an unnamed party for this type. */
export async function resolvePartyIdForAssign(
  userId: string,
  partyId: string,
  type: PartyType,
  parties: Party[],
  refresh?: () => Promise<void>
): Promise<string> {
  if (partyId) return partyId;

  const match = parties.find((p) => p.partyType === type);
  if (match) return match.id;

  const id = await createParty(userId, {
    partyType: type,
    name: "Unnamed party",
  });
  await refresh?.();
  return id;
}
