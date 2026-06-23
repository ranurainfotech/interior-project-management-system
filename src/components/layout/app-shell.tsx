"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";
import { GlobalFab } from "./global-fab";
import { PageLoading } from "./page-loading";

const publicPaths = ["/login", "/signup"];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPath) router.replace("/login");
    else if (user && isPublicPath) router.replace("/dashboard");
  }, [user, loading, isPublicPath, router]);

  if (loading && !isPublicPath) return <PageLoading fullScreen />;
  if (isPublicPath) return <>{children}</>;
  if (loading) return <PageLoading fullScreen />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="app-content mx-auto w-full flex-1">
          {children}
        </div>
        <BottomNav />
        <GlobalFab />
      </div>
    </div>
  );
}
