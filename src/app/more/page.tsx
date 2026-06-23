"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppScreen } from "@/components/layout/app-screen";
import { PageBody } from "@/components/layout/section";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { layout, typo } from "@/lib/design";
import { DeleteAllDataSection } from "@/components/forms/delete-all-data-section";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Signed out");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <AppScreen header={<AppHeader title="Profile" />}>
      <PageBody className="gap-4">
        <div className={layout.card}>
          <p className={typo("caption")}>Signed in as</p>
          <p className="mt-1 font-medium leading-tight">{user?.email}</p>
        </div>

        <div className={`${layout.card} flex flex-col items-center text-center`}>
          <BrandLogo variant="full" className="max-h-14" />
          <p className={`mt-4 ${typo("caption")}`}>{BRAND.tagline}</p>
          <a
            href={BRAND.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${layout.rowBetween} mt-5 w-full border-t border-border pt-4 text-sm font-medium`}
          >
            Visit website
            <ExternalLink className="h-4 w-4 shrink-0 text-subtext" />
          </a>
        </div>

        <DeleteAllDataSection />

        <Button
          variant="destructive"
          className="h-14 w-full rounded-2xl text-base"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign out
        </Button>
      </PageBody>
    </AppScreen>
  );
}
