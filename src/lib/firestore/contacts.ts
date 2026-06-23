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
import type { ProjectContact } from "@/types";
import {
  parseSoftDelete,
  softDeleteFields,
  createFields,
  filterActive,
} from "./helpers";

function docToContact(id: string, data: Record<string, unknown>): ProjectContact {
  return {
    id,
    userId: data.userId as string,
    projectId: data.projectId as string,
    name: data.name as string,
    phone: data.phone as string,
    notes: data.notes as string | undefined,
    ...parseSoftDelete(data),
  };
}

export async function getProjectContacts(
  userId: string,
  projectId: string
): Promise<ProjectContact[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.projectContacts),
    where("userId", "==", userId),
    where("projectId", "==", projectId)
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToContact(d.id, d.data()))
  );
}

export async function createProjectContact(
  userId: string,
  data: { projectId: string; name: string; phone: string; notes?: string }
): Promise<string> {
  const ref = await addDoc(collection(getClientDb(), COLLECTIONS.projectContacts), {
    userId,
    ...data,
    ...createFields(),
  });
  void AnalyticsEvents.contactAdded();
  return ref.id;
}

export async function updateProjectContact(
  id: string,
  data: Partial<{ name: string; phone: string; notes: string }>
): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.projectContacts, id), data);
}

export async function softDeleteProjectContact(id: string): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.projectContacts, id), softDeleteFields());
}

export async function deleteProjectContact(id: string): Promise<void> {
  return softDeleteProjectContact(id);
}
