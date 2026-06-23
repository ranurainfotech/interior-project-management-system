import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  fullScreen?: boolean;
  label?: string;
}

export function PageLoading({
  fullScreen = false,
  label = "Loading...",
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        fullScreen ? "min-h-screen" : "py-16"
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent-brand" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
