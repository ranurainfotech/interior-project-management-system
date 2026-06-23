"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useUserData } from "@/lib/data/user-data-context";
import { getPartyTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { SegmentControl } from "@/components/ui/segment-control";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { layout, typo } from "@/lib/design";
import type { PartyType, PartyWithStats } from "@/types";

type PartyFilter = "all" | PartyType;

export default function PartiesPage() {
  const { parties: partyList, projectParties, transactions } = useUserData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PartyFilter>("all");

  const parties = useMemo<PartyWithStats[]>(
    () =>
      partyList.map((party) => {
        const history = projectParties.filter((a) => a.partyId === party.id);
        const totals = getPartyTotals(party.id, history, transactions);
        const projectCount = new Set(history.map((h) => h.projectId)).size;
        return { ...party, ...totals, projectCount };
      }),
    [partyList, projectParties, transactions]
  );

  const filtered = useMemo(() => {
    return parties.filter((p) => {
      if (filter !== "all" && p.partyType !== filter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [parties, search, filter]);

  return (
    <AppScreen header={<AppHeader title="Parties" />}>
      <PageBody className="gap-4">
        <SegmentControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "labour", label: "Labour" },
            { value: "material", label: "Material" },
          ]}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtext" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-border bg-card pl-11 shadow-card"
          />
        </div>

        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
          {filtered.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <div className={`${layout.row} ${layout.card}`}>
                <Avatar name={party.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">
                    {party.name}
                  </p>
                  <p className={`mt-0.5 truncate ${typo("caption")}`}>
                    {(party.skills ?? party.categories ?? [])
                      .slice(0, 3)
                      .join(", ") || "—"}
                  </p>
                  <p className={`mt-1 ${typo("caption")}`}>
                    {party.projectCount} Projects ·{" "}
                    {party.totalOverpaid > 0 ? (
                      <span className="font-semibold text-danger">
                        Overpaid {formatCurrency(party.totalOverpaid)}
                      </span>
                    ) : party.totalDue > 0 ? (
                      <span className="font-semibold text-warning">
                        {formatCurrency(party.totalDue)} Due
                      </span>
                    ) : (
                      <span className="font-semibold text-success">
                        {formatCurrency(party.totalPaid)} Paid
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageBody>
    </AppScreen>
  );
}
