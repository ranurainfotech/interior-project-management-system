"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { setAnalyticsUser, trackScreenView } from "@/lib/tracking";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    void trackScreenView(pathname);
  }, [pathname]);

  useEffect(() => {
    void setAnalyticsUser(user?.uid ?? null);
  }, [user?.uid]);

  return children;
}
