import { formatCurrency } from "@/lib/format";

export function CollectionProgress({
  received,
  pending,
  contractAmount,
  percent,
}: {
  received: number;
  pending: number;
  contractAmount: number;
  percent: number;
}) {
  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card">
      <p className="text-sm font-semibold text-foreground">Project progress</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-subtext">Contract</p>
          <p className="mt-1 text-sm font-bold tabular-nums">
            {formatCurrency(contractAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-subtext">Received</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-success">
            {formatCurrency(received)}
          </p>
        </div>
        <div>
          <p className="text-xs text-subtext">Pending</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-warning">
            {formatCurrency(pending)}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-subtext">Collected</span>
          <span className="font-semibold text-primary">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
