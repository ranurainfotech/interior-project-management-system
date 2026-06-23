"use client";

import { isFirebaseConfigured, getMissingFirebaseEnvKeys } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export function FirebaseSetupError() {
  const missing = getMissingFirebaseEnvKeys();
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Firebase not configured</h1>
      {isLocal ? (
        <>
          <p className="max-w-md text-sm text-subtext">
            Add your Firebase web app keys to{" "}
            <code className="text-foreground">.env.local</code> in the project
            root (copy from <code className="text-foreground">.env.example</code>
            ), then restart the dev server:
          </p>
          <pre className="max-w-md overflow-x-auto rounded-xl bg-muted px-4 py-3 text-left text-xs">
            npm run dev
          </pre>
          <p className="max-w-md text-xs text-subtext">
            Get values from Firebase Console → Project settings → Your apps →
            Web app config.
          </p>
        </>
      ) : (
        <p className="max-w-md text-sm text-subtext">
          Add all <code className="text-foreground">NEXT_PUBLIC_FIREBASE_*</code>{" "}
          values in your Vercel project settings, then redeploy.
        </p>
      )}
      {missing.length > 0 ? (
        <ul className="max-w-md list-inside list-disc text-left text-xs text-subtext">
          {missing.map((key) => (
            <li key={key}>
              <code className="text-foreground">{key}</code>
            </li>
          ))}
        </ul>
      ) : null}
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
