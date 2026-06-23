"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { reauthenticateWithPassword } from "@/lib/auth/reauthenticate";
import { deleteAllUserData } from "@/lib/firestore/delete-all-user-data";
import { isDeleteAllDataEnabled } from "@/lib/env";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/layout/section";
import { layout, typo } from "@/lib/design";
import { toast } from "sonner";

export function DeleteAllDataSection() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isDeleteAllDataEnabled()) {
    return null;
  }

  const handleDeleteAll = async () => {
    if (!user) {
      toast.error("Please sign in again");
      return;
    }
    if (!password) {
      toast.error("Enter your password to continue");
      return;
    }

    const confirmed = window.confirm(
      "Delete ALL projects, parties, contacts, and transactions? This cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await reauthenticateWithPassword(password);
      const counts = await deleteAllUserData(user.uid);
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setPassword("");
      toast.success(`Deleted ${total} records`);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: string }).code)
          : "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials"
      ) {
        toast.error("Incorrect password");
      } else {
        toast.error(getFirestoreErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Test</SectionTitle>
      <div className="rounded-[24px] border border-danger/25 bg-danger/5 p-4">
        <p className="text-sm font-semibold text-danger">Delete all data</p>
        <p className={`mt-2 ${typo("caption")}`}>
          Permanently removes every project, party, contact, and transaction for
          your account. Enter your password to confirm.
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="delete-all-password">Password</Label>
          <Input
            id="delete-all-password"
            type="password"
            autoComplete="current-password"
            className={`${layout.cardSm} h-12 border-border px-4`}
            placeholder="Your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="button"
          variant="destructive"
          className="mt-4 h-12 w-full rounded-2xl"
          onClick={handleDeleteAll}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {loading ? "Deleting..." : "Delete everything"}
        </Button>
      </div>
    </section>
  );
}
