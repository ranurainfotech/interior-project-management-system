import { Timestamp } from "firebase/firestore";
import { filterActive } from "@/lib/design";

export function parseSoftDelete(data: Record<string, unknown>) {
  const deletedAt =
    data.deletedAt instanceof Timestamp
      ? data.deletedAt.toDate().toISOString()
      : (data.deletedAt as string | undefined);
  return {
    isDeleted: (data.isDeleted as boolean) ?? false,
    deletedAt,
  };
}

export function softDeleteFields() {
  return {
    isDeleted: true,
    deletedAt: Timestamp.now(),
  };
}

export function createFields() {
  return {
    isDeleted: false,
  };
}

/** Firestore rejects `undefined` field values — omit those keys. */
export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export { filterActive };
