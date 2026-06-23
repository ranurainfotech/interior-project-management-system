import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { AnalyticsEvents } from "@/lib/tracking";
import { COLLECTIONS } from "@/constants";
import type { ProjectParty, PartyType } from "@/types";
import {
  parseSoftDelete,
  softDeleteFields,
  createFields,
  filterActive,
} from "./helpers";

function docToProjectParty(
  id: string,
  data: Record<string, unknown>
): ProjectParty {
  return {
    id,
    userId: data.userId as string,
    projectId: data.projectId as string,
    partyId: data.partyId as string,
    type: data.type as PartyType,
    skillUsed: data.skillUsed as string | undefined,
    categoryUsed: data.categoryUsed as string | undefined,
    agreedAmount: data.agreedAmount as number,
    ...parseSoftDelete(data),
  };
}

export async function getProjectParties(
  userId: string,
  projectId: string
): Promise<ProjectParty[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.projectParties),
    where("userId", "==", userId),
    where("projectId", "==", projectId)
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToProjectParty(d.id, d.data()))
  );
}

export async function getProjectPartiesByType(
  userId: string,
  projectId: string,
  type: PartyType
): Promise<ProjectParty[]> {
  const parties = await getProjectParties(userId, projectId);
  return parties.filter((pp) => pp.type === type);
}

export async function getAllProjectParties(
  userId: string
): Promise<ProjectParty[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.projectParties),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToProjectParty(d.id, d.data()))
  );
}

export async function getPartyProjectHistory(
  userId: string,
  partyId: string
): Promise<ProjectParty[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.projectParties),
    where("userId", "==", userId),
    where("partyId", "==", partyId)
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToProjectParty(d.id, d.data()))
  );
}

export async function assignPartyToProject(
  userId: string,
  data: {
    projectId: string;
    partyId: string;
    type: PartyType;
    skillUsed?: string;
    categoryUsed?: string;
    agreedAmount: number;
  }
): Promise<string> {
  const ref = await addDoc(collection(getClientDb(), COLLECTIONS.projectParties), {
    userId,
    ...data,
    ...createFields(),
  });
  void AnalyticsEvents.partyAssigned(data.type);
  return ref.id;
}

export async function updateProjectParty(
  id: string,
  data: Partial<{
    skillUsed: string;
    categoryUsed: string;
    agreedAmount: number;
  }>
): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.projectParties, id), data);
}

export async function softDeleteProjectParty(id: string): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.projectParties, id), softDeleteFields());
}

export async function removeProjectParty(id: string): Promise<void> {
  return softDeleteProjectParty(id);
}
