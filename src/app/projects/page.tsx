"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { softDeleteProject } from "@/lib/firestore/projects";
import { getProjectSummary } from "@/lib/calculations";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { ProjectSummaryCard } from "@/components/cards/project-summary-card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";

type StatusFilter = "all" | ProjectStatus;

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, projectParties, transactions, refresh } = useUserData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const projectsWithSummary = useMemo(
    () =>
      projects.map((project) => {
        const pp = projectParties.filter((p) => p.projectId === project.id);
        const t = transactions.filter((txn) => txn.projectId === project.id);
        const summary = getProjectSummary(project, pp, t);
        return {
          ...project,
          clientDue: summary.clientDue,
          profit: summary.profit,
          paidOut: summary.paidOut,
        };
      }),
    [projects, projectParties, transactions]
  );

  const filtered = useMemo(() => {
    return projectsWithSummary.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [projectsWithSummary, search, statusFilter]);

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!user) return;
    const confirmed = window.confirm(
      `Delete "${projectName}"? Its transactions, contacts, and assignments will also be removed.`
    );
    if (!confirmed) return;

    setDeletingId(projectId);
    try {
      await softDeleteProject(user.uid, projectId);
      await refresh();
      toast.success("Project deleted");
    } catch (error) {
      toast.error(getFirestoreErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppScreen header={<AppHeader title="Projects" />}>
      <PageBody className="gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtext" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-border bg-card pl-11 shadow-card"
          />
        </div>

        <FilterChips
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "on_hold", label: "On hold" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
          {filtered.map((project) => (
            <ProjectSummaryCard
              key={project.id}
              id={project.id}
              name={project.name}
              status={project.status}
              clientEstimate={project.contractAmount}
              clientDue={project.clientDue}
              profit={project.profit}
              paidOut={project.paidOut}
              deleting={deletingId === project.id}
              onDelete={() => handleDelete(project.id, project.name)}
            />
          ))}
        </div>
      </PageBody>
    </AppScreen>
  );
}
