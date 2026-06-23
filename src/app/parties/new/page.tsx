"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PartyForm } from "@/components/forms/party-form";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageLoading } from "@/components/layout/page-loading";
import type { PartyType } from "@/types";

function NewPartyContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as PartyType | null;
  const title =
    type === "material"
      ? "Add Material"
      : type === "labour"
        ? "Add Labour"
        : "Add Party";

  return (
    <AppScreen header={<AppHeader title={title} backHref="/parties" />}>
      <PartyForm defaultType={type ?? undefined} />
    </AppScreen>
  );
}

export default function NewPartyPage() {
  return (
    <Suspense fallback={<PageLoading fullScreen />}>
      <NewPartyContent />
    </Suspense>
  );
}
