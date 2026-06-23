import { formatCurrency } from "@/lib/format";
import { hasBudget } from "@/lib/calculations";

export function CollectionProgress({
  received,
  pending,
  contractAmount,
  percent,
  clientOverpaid = 0,
  hasClientEstimate = false,
}: {
  received: number;
  pending: number | null;
  contractAmount: number;
  percent: number;
  clientOverpaid?: number;
  hasClientEstimate?: boolean;
}) {
  if (!hasClientEstimate || !hasBudget(contractAmount)) {
    return (
      <div className="rounded-[24px] bg-card p-5 shadow-card">
        <p className="text-sm font-semibold text-foreground">Cash flow</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-subtext">Received from client</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-success">
              {formatCurrency(received)}
            </p>
          </div>
          <div>
            <p className="text-xs text-subtext">Net on payments</p>
            <p className="mt-1 text-sm font-bold tabular-nums">
              Tracked from transactions
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-subtext">
          Add a client estimate on the overview to see collection progress against
          scope.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card">
      <p className="text-sm font-semibold text-foreground">
        Against current estimate
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-subtext">Estimate</p>
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
            {pending !== null ? formatCurrency(pending) : "—"}
          </p>
        </div>
      </div>
      {clientOverpaid > 0 ? (
        <p className="mt-3 text-sm font-semibold text-danger">
          Overpaid by {formatCurrency(clientOverpaid)} vs current estimate
        </p>
      ) : null}
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
