"use client";

import { useState } from "react";
import { updateProject } from "@/lib/firestore/projects";
import { PROJECT_STATUSES } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";
import {
  FormDialogFooter,
  FormField,
  FormStack,
  formSelectTriggerClass,
} from "./form-layout";

interface EditProjectStatusFormProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onSuccess?: () => void;
}

export function EditProjectStatusForm({
  projectId,
  currentStatus,
  onSuccess,
}: EditProjectStatusFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProject(projectId, { status });
      toast.success("Project status updated");
      onSuccess?.();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormStack className="px-5 py-5">
        <FormField label="Status">
          <Select
            value={status}
            onValueChange={(v) => setStatus((v ?? "active") as ProjectStatus)}
          >
            <SelectTrigger className={formSelectTriggerClass}>
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
        </FormField>
        <p className="text-xs leading-snug text-subtext">
          Active projects count toward dashboard totals. Completed and on-hold
          projects stay in your list but are excluded from active metrics.
        </p>
      </FormStack>
      <FormDialogFooter
        label="Save status"
        loading={loading}
        loadingLabel="Saving..."
      />
    </form>
  );
}
