import { formatCompactCurrency } from "@/lib/format";
import type { MonthlyCashFlow } from "@/lib/analytics";
import { CHART_COLORS } from "@/lib/analytics/dashboard";

export function CashFlowChart({ data }: { data: MonthlyCashFlow[] }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => [d.received, d.paid])
  );

  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Monthly cash flow</p>
        <div className="flex gap-4 text-xs text-subtext">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS.received }}
            />
            Received
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS.paid }}
            />
            Paid
          </span>
        </div>
      </div>

      {data.every((d) => d.received === 0 && d.paid === 0) ? (
        <p className="py-8 text-center text-sm text-subtext">
          No transactions in the last 6 months
        </p>
      ) : (
        <div className="flex h-44 items-end justify-between gap-2">
          {data.map((month) => (
            <div
              key={month.monthKey}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-36 w-full items-end justify-center gap-1">
                <div
                  className="w-[42%] rounded-t-md transition-all"
                  style={{
                    height: `${(month.received / maxValue) * 100}%`,
                    minHeight: month.received > 0 ? 4 : 0,
                    backgroundColor: CHART_COLORS.received,
                  }}
                  title={`Received ${formatCompactCurrency(month.received)}`}
                />
                <div
                  className="w-[42%] rounded-t-md transition-all"
                  style={{
                    height: `${(month.paid / maxValue) * 100}%`,
                    minHeight: month.paid > 0 ? 4 : 0,
                    backgroundColor: CHART_COLORS.paid,
                  }}
                  title={`Paid ${formatCompactCurrency(month.paid)}`}
                />
              </div>
              <p className="text-xs font-medium text-subtext">{month.monthLabel}</p>
              <p className="text-[10px] tabular-nums text-subtext">
                {formatCompactCurrency(month.net)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
