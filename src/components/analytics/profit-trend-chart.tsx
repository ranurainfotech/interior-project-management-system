import { formatCompactCurrency } from "@/lib/format";
import type { MonthlyCashFlow } from "@/lib/analytics";

export function ProfitTrendChart({
  data,
  title = "Profit trend",
}: {
  data: MonthlyCashFlow[];
  title?: string;
}) {
  const values = data.map((d) => d.net);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card">
      <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
      {data.every((d) => d.received === 0 && d.paid === 0) ? (
        <p className="py-6 text-center text-sm text-subtext">
          Not enough data yet
        </p>
      ) : (
        <div className="flex h-40 items-end justify-between gap-2">
          {data.map((month) => {
            const height = ((month.net - min) / range) * 100;
            const positive = month.net >= 0;
            return (
              <div
                key={month.monthKey}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <p className="text-[10px] font-medium tabular-nums text-subtext">
                  {formatCompactCurrency(month.net)}
                </p>
                <div
                  className="w-full max-w-10 rounded-t-md"
                  style={{
                    height: `${Math.max(height, month.net !== 0 ? 8 : 0)}%`,
                    backgroundColor: positive ? "#16a34a" : "#dc2626",
                  }}
                />
                <p className="text-xs text-subtext">{month.monthLabel}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
