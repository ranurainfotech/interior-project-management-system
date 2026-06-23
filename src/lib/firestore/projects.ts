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
  Timestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { AnalyticsEvents } from "@/lib/tracking";
import { COLLECTIONS } from "@/constants";
import type { Project, ProjectStatus } from "@/types";
import {
  parseSoftDelete,
  softDeleteFields,
  createFields,
  filterActive,
} from "./helpers";

function docToProject(id: string, data: Record<string, unknown>): Project {
  const startDate =
    data.startDate instanceof Timestamp
      ? data.startDate.toDate().toISOString().split("T")[0]
      : (data.startDate as string);
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string);
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string);

  return {
    id,
    userId: data.userId as string,
    name: data.name as string,
    contractAmount: data.contractAmount as number,
    status: data.status as ProjectStatus,
    startDate,
    createdAt,
    updatedAt,
    ...parseSoftDelete(data),
  };
}

export async function getProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.projects),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToProject(d.id, d.data()))
  );
}

export async function getActiveProjects(userId: string): Promise<Project[]> {
  const projects = await getProjects(userId);
  return projects.filter((p) => p.status === "active");
}

export async function getProject(id: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(getClientDb(), COLLECTIONS.projects, id));
  if (!snapshot.exists()) return null;
  const project = docToProject(snapshot.id, snapshot.data());
  return project.isDeleted ? null : project;
}

export async function createProject(
  userId: string,
  data: {
    name: string;
    contractAmount: number;
    status: ProjectStatus;
    startDate: string;
  }
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(getClientDb(), COLLECTIONS.projects), {
    userId,
    ...data,
    ...createFields(),
    startDate: Timestamp.fromDate(new Date(data.startDate)),
    createdAt: now,
    updatedAt: now,
  });
  void AnalyticsEvents.projectCreated();
  return ref.id;
}

export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    contractAmount: number;
    status: ProjectStatus;
    startDate: string;
  }>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
  }
  await updateDoc(doc(getClientDb(), COLLECTIONS.projects, id), updateData);
}

export async function softDeleteProject(id: string): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.projects, id), {
    ...softDeleteFields(),
    updatedAt: Timestamp.now(),
  });
}

/** @deprecated Use softDeleteProject */
export async function deleteProject(id: string): Promise<void> {
  return softDeleteProject(id);
}
