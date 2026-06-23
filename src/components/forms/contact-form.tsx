"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { createProjectContact } from "@/lib/firestore/contacts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FormDialogFooter,
  FormField,
  FormStack,
  formInputClass,
  formTextareaClass,
} from "./form-layout";

interface ContactFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function ContactForm({ projectId, onSuccess }: ContactFormProps) {
  const { user } = useAuth();
  const { runGuarded } = useSubmitGuard();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        await createProjectContact(user.uid, {
          projectId,
          name: name.trim() || "Contact",
          phone: phone.trim() || "N/A",
          notes: notes.trim() || undefined,
        });
        toast.success("Contact added");
        setName("");
        setPhone("");
        setNotes("");
        onSuccess?.();
      } catch {
        toast.error("Failed to add contact");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField label="Name" htmlFor="contact-name">
          <Input
            id="contact-name"
            className={formInputClass}
            placeholder="Rahul Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>
        <FormField
          label="Phone"
          htmlFor="contact-phone"
          hint="Used for call and WhatsApp shortcuts when provided"
        >
          <Input
            id="contact-phone"
            type="tel"
            className={formInputClass}
            placeholder="9999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormField>
        <FormField label="Notes" htmlFor="contact-notes">
          <Textarea
            id="contact-notes"
            className={formTextareaClass}
            placeholder="Primary site contact, availability, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </FormField>
      </FormStack>
      <FormDialogFooter
        label="Add contact"
        loading={loading}
        loadingLabel="Adding..."
      />
    </form>
  );
}
