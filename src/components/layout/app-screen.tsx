import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AppScreenProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AppScreen({
  header,
  children,
  className,
  noPadding,
}: AppScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        "pb-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px))] md:pb-8"
      )}
    >
      {header}
      <main
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto",
          !noPadding && "px-4 md:px-0",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
