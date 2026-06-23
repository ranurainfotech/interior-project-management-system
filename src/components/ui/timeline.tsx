"use client";

import { format, isToday, isYesterday, parseISO } from "date-fns";

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
}

function formatDateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM");
}

export function Timeline({
  items,
  emptyMessage = "Nothing here yet",
}: {
  items: TimelineItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-subtext">{emptyMessage}</p>
    );
  }

  return (
    <div className="relative ml-1 pl-7">
      <div className="absolute bottom-3 left-[11px] top-3 w-px bg-border" />
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className="absolute -left-7 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-card" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug text-foreground">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="mt-1 text-sm leading-snug text-subtext">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <p className="shrink-0 pt-0.5 text-right text-sm leading-snug text-subtext">
                {formatDateLabel(item.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
