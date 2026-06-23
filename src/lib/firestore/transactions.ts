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
import type { Transaction, TransactionType } from "@/types";
import {
  parseSoftDelete,
  softDeleteFields,
  createFields,
  filterActive,
  omitUndefined,
} from "./helpers";

function docToTransaction(
  id: string,
  data: Record<string, unknown>
): Transaction {
  const date =
    data.date instanceof Timestamp
      ? data.date.toDate().toISOString().split("T")[0]
      : (data.date as string);

  return {
    id,
    userId: data.userId as string,
    projectId: data.projectId as string,
    partyId: data.partyId as string | undefined,
    transactionType: data.transactionType as TransactionType,
    amount: data.amount as number,
    date,
    note: data.note as string | undefined,
    attachmentUrl: data.attachmentUrl as string | undefined,
    ...parseSoftDelete(data),
  };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.transactions),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToTransaction(d.id, d.data()))
  );
}

export async function getProjectTransactions(
  userId: string,
  projectId: string
): Promise<Transaction[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.transactions),
    where("userId", "==", userId),
    where("projectId", "==", projectId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToTransaction(d.id, d.data()))
  );
}

export async function getPartyTransactions(
  userId: string,
  partyId: string
): Promise<Transaction[]> {
  const q = query(
    collection(getClientDb(), COLLECTIONS.transactions),
    where("userId", "==", userId),
    where("partyId", "==", partyId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return filterActive(
    snapshot.docs.map((d) => docToTransaction(d.id, d.data()))
  );
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const snapshot = await getDoc(doc(getClientDb(), COLLECTIONS.transactions, id));
  if (!snapshot.exists()) return null;
  const txn = docToTransaction(snapshot.id, snapshot.data());
  return txn.isDeleted ? null : txn;
}

export async function createTransaction(
  userId: string,
  data: {
    projectId: string;
    partyId?: string;
    transactionType: TransactionType;
    amount: number;
    date: string;
    note?: string;
    attachmentUrl?: string;
  }
): Promise<string> {
  const ref = await addDoc(
    collection(getClientDb(), COLLECTIONS.transactions),
    omitUndefined({
      userId,
      projectId: data.projectId,
      transactionType: data.transactionType,
      amount: data.amount,
      partyId: data.partyId,
      note: data.note,
      attachmentUrl: data.attachmentUrl,
      ...createFields(),
      date: Timestamp.fromDate(new Date(`${data.date}T12:00:00`)),
    })
  );
  void AnalyticsEvents.transactionCreated(data.transactionType);
  return ref.id;
}

export async function updateTransaction(
  id: string,
  data: Partial<{
    amount: number;
    date: string;
    note: string;
    partyId: string;
    transactionType: TransactionType;
    attachmentUrl: string;
  }>
): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) {
    updateData.date = Timestamp.fromDate(new Date(data.date));
  }
  await updateDoc(doc(getClientDb(), COLLECTIONS.transactions, id), updateData);
}

export async function softDeleteTransaction(id: string): Promise<void> {
  await updateDoc(doc(getClientDb(), COLLECTIONS.transactions, id), softDeleteFields());
}

export async function deleteTransaction(id: string): Promise<void> {
  return softDeleteTransaction(id);
}
