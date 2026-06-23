import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { AnalyticsEvents } from "@/lib/tracking";
import { COLLECTIONS } from "@/constants";
import type { Party, PartyType } from "@/types";
import {
  parseSoftDelete,
  softDeleteFields,
  createFields,
  filterActive,
} from "./helpers";

function docToParty(id: string, data: Record<string, unknown>): Party {
  return {
    id,
    userId: data.userId as string,
    partyType: data.partyType as PartyType,
    name: data.name as string,
    phone: data.phone as string | undefined,
    skills: data.skills as string[] | undefined,
    categories: data.categories as string[] | undefined,
    ...parseSoftDelete(data),
  };
}

export async function getParties(userId: string): Promise<Party[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.parties),
    where("userId", "==", userId),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  return filterActive(snapshot.docs.map((d) => docToParty(d.id, d.data())));
}

export async function getPartiesByType(
  userId: string,
  partyType: PartyType
): Promise<Party[]> {
  const parties = await getParties(userId);
  return parties.filter((p) => p.partyType === partyType);
}

export async function getParty(id: string): Promise<Party | null> {
  const snapshot = await getDoc(doc(getClientDb(), COLLECTIONS.parties, id));
  if (!snapshot.exists()) return null;
  const party = docToParty(snapshot.id, snapshot.data());
  return party.isDeleted ? null : party;
}

export async function createParty(
  userId: string,
  data: {
    partyType: PartyType;
    name: string;
    phone?: string;
    skills?: string[];
    categories?: string[];
  }
): Promise<string> {
  const ref = await addDoc(collection(getClientDb(), COLLECTIONS.parties), {
    userId,
    ...data,
    ...createFields(),
  });
  void AnalyticsEvents.partyCreated(data.partyType);
  return ref.id;
}

export async function updateParty(
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    skills: string[];
    categories: string[];
  }>
): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.parties, id), data);
}

export async function softDeleteParty(id: string): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.parties, id), softDeleteFields());
}

export async function deleteParty(id: string): Promise<void> {
  return softDeleteParty(id);
}
