"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TransactionForm } from "@/components/forms/transaction-form";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageLoading } from "@/components/layout/page-loading";
import type { TransactionType } from "@/types";

function NewTransactionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? undefined;
  const type = searchParams.get("type") as TransactionType | null;

  return (
    <AppScreen
      header={
        <AppHeader
          title="Add Transaction"
          backHref={projectId ? `/projects/${projectId}` : "/transactions"}
        />
      }
    >
      <TransactionForm
        defaultProjectId={projectId}
        defaultType={type ?? undefined}
        onSuccess={() =>
          router.push(projectId ? `/projects/${projectId}` : "/transactions")
        }
      />
    </AppScreen>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<PageLoading fullScreen />}>
      <NewTransactionContent />
    </Suspense>
  );
}
