"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getProjects } from "@/lib/firestore/projects";
import { getAllProjectParties } from "@/lib/firestore/project-parties";
import { getTransactions } from "@/lib/firestore/transactions";
import { getProjectSummary } from "@/lib/calculations";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { PageLoading } from "@/components/layout/page-loading";
import { ProjectSummaryCard } from "@/components/cards/project-summary-card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Input } from "@/components/ui/input";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import type { ProjectStatus, ProjectWithSummary } from "@/types";

type StatusFilter = "all" | ProjectStatus;

export default function ProjectsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [projs, parties, txns] = await Promise.all([
          getProjects(user!.uid),
          getAllProjectParties(user!.uid),
          getTransactions(user!.uid),
        ]);
        setProjects(
          projs.map((project) => {
            const pp = parties.filter((p) => p.projectId === project.id);
            const t = txns.filter((txn) => txn.projectId === project.id);
            const summary = getProjectSummary(project, pp, t);
            return {
              ...project,
              clientDue: summary.clientDue,
              profit: summary.profit,
            };
          })
        );
      } catch (error) {
        toast.error(getFirestoreErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [projects, search, statusFilter]);

  if (loading) return <PageLoading fullScreen />;

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
            { value: "on_hold", label: "On Hold" },
          ]}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-subtext">
              No projects found
            </p>
          ) : (
            filtered.map((project) => (
              <ProjectSummaryCard
                key={project.id}
                id={project.id}
                name={project.name}
                status={project.status}
                contractAmount={project.contractAmount}
                clientDue={project.clientDue}
                profit={project.profit}
              />
            ))
          )}
        </div>
      </PageBody>
    </AppScreen>
  );
}
