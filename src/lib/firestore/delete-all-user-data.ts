import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { getClientDb } from "@/lib/firebase";

const USER_COLLECTIONS = [
  COLLECTIONS.transactions,
  COLLECTIONS.projectParties,
  COLLECTIONS.projectContacts,
  COLLECTIONS.parties,
  COLLECTIONS.projects,
] as const;

const BATCH_LIMIT = 500;

async function hardDeleteUserDocs(
  userId: string,
  collectionName: string
): Promise<number> {
  const db = getClientDb();
  const snapshot = await getDocs(
    query(collection(db, collectionName), where("userId", "==", userId))
  );

  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + BATCH_LIMIT).forEach((item) => {
      batch.delete(doc(db, collectionName, item.id));
    });
    await batch.commit();
  }

  return snapshot.docs.length;
}

export type DeleteAllUserDataResult = Record<string, number>;

export async function deleteAllUserData(
  userId: string
): Promise<DeleteAllUserDataResult> {
  const counts: DeleteAllUserDataResult = {};

  for (const collectionName of USER_COLLECTIONS) {
    counts[collectionName] = await hardDeleteUserDocs(userId, collectionName);
  }

  return counts;
}
