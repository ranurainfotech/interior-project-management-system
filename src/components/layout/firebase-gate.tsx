"use client";

import { isFirebaseConfigured } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export function FirebaseSetupError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">App configuration missing</h1>
      <p className="max-w-md text-sm text-subtext">
        Firebase environment variables were not included in this deployment.
        Add all <code className="text-foreground">NEXT_PUBLIC_FIREBASE_*</code>{" "}
        values in Vercel, then redeploy.
      </p>
      <Button type="button" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}

export function FirebaseGate({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupError />;
  }

  return children;
}
