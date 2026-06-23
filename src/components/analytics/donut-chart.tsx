import { formatCurrency } from "@/lib/format";
import type { BreakdownSlice } from "@/lib/analytics";

export function DonutChart({
  slices,
  title,
}: {
  slices: BreakdownSlice[];
  title?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.amount, 0);
  const gradient =
    total > 0
      ? `conic-gradient(${slices
          .reduce<{ parts: string[]; cursor: number }>(
            (acc, slice) => {
              const end = acc.cursor + slice.percent;
              acc.parts.push(`${slice.color} ${acc.cursor}% ${end}%`);
              acc.cursor = end;
              return acc;
            },
            { parts: [], cursor: 0 }
          )
          .parts.join(", ")})`
      : "conic-gradient(#e5e7eb 0% 100%)";

  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card">
      {title ? (
        <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
      ) : null}
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{ background: gradient }}
        >
          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-card text-center">
            <p className="text-[10px] uppercase tracking-wide text-subtext">
              Total
            </p>
            <p className="text-sm font-bold tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate text-sm">{slice.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {slice.percent}%
                </p>
                <p className="text-xs tabular-nums text-subtext">
                  {formatCurrency(slice.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
