"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { createProject } from "@/lib/firestore/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";
import { formInputClass } from "@/components/forms/form-layout";

export function ProjectForm() {
  const { user } = useAuth();
  const { refresh } = useUserData();
  const { runGuarded, lock } = useSubmitGuard();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [startDate, setStartDate] = useState(toDateInputValue());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        const id = await createProject(user.uid, {
          name: name.trim() || "Untitled project",
          contractAmount: parseOptionalAmount(contractAmount),
          status,
          startDate: startDate || toDateInputValue(),
        });
        await refresh();
        toast.success("Project created");
        lock();
        router.push(`/projects/${id}`);
      } catch {
        toast.error("Failed to create project");
        setLoading(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          className={formInputClass}
          placeholder="Patel Residence"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contractAmount">Client estimate</Label>
        <AmountInput
          id="contractAmount"
          className={formInputClass}
          placeholder="Leave empty if unknown"
          value={contractAmount}
          onValueChange={setContractAmount}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start date</Label>
        <Input
          id="startDate"
          type="date"
          className={formInputClass}
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
          <SelectTrigger>
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
