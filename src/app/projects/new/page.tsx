"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { createProject } from "@/lib/firestore/projects";
import { createProjectContact } from "@/lib/firestore/contacts";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { Button } from "@/components/ui/button";
import { StickySave } from "@/components/ui/sticky-save";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUSES } from "@/constants";
import { toDateInputValue } from "@/lib/format";
import { parseOptionalAmount } from "@/lib/forms/defaults";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { ProjectStatus } from "@/types";

interface ContactDraft {
  name: string;
  phone: string;
  notes: string;
}

function hasContactContent(contact: ContactDraft): boolean {
  return Boolean(
    contact.name.trim() || contact.phone.trim() || contact.notes.trim()
  );
}

export default function NewProjectPage() {
  const { user } = useAuth();
  const { refresh } = useUserData();
  const { runGuarded, lock, release } = useSubmitGuard();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [contacts, setContacts] = useState<ContactDraft[]>([
    { name: "", phone: "", notes: "" },
  ]);

  const addContact = () =>
    setContacts((c) => [...c, { name: "", phone: "", notes: "" }]);

  const updateContact = (i: number, field: keyof ContactDraft, value: string) => {
    setContacts((c) =>
      c.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );
  };

  const removeContact = (i: number) => {
    if (contacts.length === 1) return;
    setContacts((c) => c.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || loading) return;

    await runGuarded(async () => {
      setLoading(true);
      let projectId: string | undefined;

      try {
        projectId = await createProject(user.uid, {
          name: name.trim() || "Untitled project",
          contractAmount: parseOptionalAmount(contractAmount),
          status,
          startDate: startDate || toDateInputValue(),
        });

        const contactsToSave = contacts.filter(hasContactContent);
        let contactsFailed = 0;

        for (const contact of contactsToSave) {
          try {
            await createProjectContact(user.uid, {
              projectId,
              name: contact.name.trim() || "Contact",
              phone: contact.phone.trim() || "N/A",
              notes: contact.notes.trim() || undefined,
            });
          } catch (error) {
            contactsFailed += 1;
            console.error("Failed to save contact", error);
          }
        }

        void refresh({ silent: true });

        if (contactsFailed > 0) {
          toast.warning(
            "Project saved. Some contacts could not be added — you can add them from the project page."
          );
        } else {
          toast.success("Project created");
        }

        lock();
        router.push(`/projects/${projectId}`);
      } catch (error) {
        if (projectId) {
          toast.warning(
            "Project was saved but something went wrong. Opening the project…"
          );
          void refresh({ silent: true });
          lock();
          router.push(`/projects/${projectId}`);
          return;
        }
        toast.error(getFirestoreErrorMessage(error));
        release();
        setLoading(false);
      }
    });
  };

  const fieldClass = "h-12 rounded-2xl border-border bg-card shadow-card";

  return (
    <AppScreen
      header={
        <AppHeader
          title={step === 1 ? "New Project" : "Add Contacts"}
          backHref="/projects"
        />
      }
    >
      {step === 1 ? (
        <form
          id="project-step-1"
          className="space-y-4 pb-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <div className="space-y-2">
            <Label>Project name</Label>
            <Input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patel Residence"
            />
          </div>
          <div className="space-y-2">
            <Label>Client estimate</Label>
            <AmountInput
              className={fieldClass}
              value={contractAmount}
              onValueChange={setContractAmount}
              placeholder="Leave empty if unknown"
            />
            <p className="text-xs text-subtext">
              Update anytime as scope changes. Cash flow is tracked from
              payments.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              className={fieldClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus((v ?? "active") as ProjectStatus)}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="h-14 w-full rounded-2xl text-base">
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-2xl"
            disabled={loading}
            onClick={() => void handleSave()}
          >
            Save without contacts
          </Button>
        </form>
      ) : (
        <form
          id="project-save-form"
          className="space-y-4 pb-32"
          onSubmit={handleSave}
        >
          {contacts.map((contact, i) => (
            <div key={i} className="space-y-3 rounded-[24px] bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-medium">Contact {i + 1}</p>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    className="text-subtext"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Input
                placeholder="Name"
                className={fieldClass}
                value={contact.name}
                onChange={(e) => updateContact(i, "name", e.target.value)}
              />
              <Input
                placeholder="Phone"
                type="tel"
                className={fieldClass}
                value={contact.phone}
                onChange={(e) => updateContact(i, "phone", e.target.value)}
              />
              <Textarea
                placeholder="Notes"
                rows={2}
                className="rounded-2xl border-border bg-card"
                value={contact.notes}
                onChange={(e) => updateContact(i, "notes", e.target.value)}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-2xl"
            onClick={addContact}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another contact
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-2xl"
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          <StickySave
            form="project-save-form"
            loading={loading}
            label="Save project"
          />
        </form>
      )}
    </AppScreen>
  );
}
