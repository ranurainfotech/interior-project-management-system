import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

interface FinanceSummaryCardsProps {
  receivable: number;
  payable: number;
  netPosition: number;
  activeProjects: number;
}

export function FinanceSummaryCards({
  receivable,
  payable,
  netPosition,
  activeProjects,
}: FinanceSummaryCardsProps) {
  const cards = [
    {
      label: "Receivable",
      value: formatCurrency(receivable),
      hint: "Clients owe you",
      valueClass: "text-warning",
    },
    {
      label: "Payable",
      value: formatCurrency(payable),
      hint: "Labour & vendors due",
      valueClass: "text-foreground",
    },
    {
      label: "Net position",
      value: formatCurrency(netPosition),
      hint: "Receivable − payable",
      valueClass: netPosition >= 0 ? "text-success" : "text-danger",
    },
    {
      label: "Active projects",
      value: String(activeProjects),
      hint: "Currently in progress",
      valueClass: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex min-h-[108px] flex-col justify-between rounded-[24px] bg-card p-4 shadow-card"
        >
          <p className="text-sm text-subtext">{card.label}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tabular-nums leading-tight",
              card.valueClass
            )}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-subtext">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
