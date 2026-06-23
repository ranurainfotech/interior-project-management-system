import { cn } from "@/lib/utils";

export function isActiveRecord<T extends { isDeleted?: boolean }>(
  item: T
): boolean {
  return !item.isDeleted;
}

export function filterActive<T extends { isDeleted?: boolean }>(
  items: T[]
): T[] {
  return items.filter(isActiveRecord);
}

export const layout = {
  page: "app-page",
  section: "flex flex-col gap-4",
  sectionTitle: "text-lg font-semibold leading-tight text-foreground",
  card: "rounded-[24px] bg-card p-4 shadow-card",
  cardSm: "rounded-[20px] bg-card p-4 shadow-card",
  row: "flex items-center gap-3",
  rowBetween: "flex items-center justify-between gap-3",
  label: "text-sm text-subtext leading-snug",
  value: "text-base font-semibold tabular-nums leading-tight text-foreground",
  valueLg: "text-xl font-bold tabular-nums leading-tight text-foreground",
} as const;

export const typography = {
  h1: "text-2xl font-semibold leading-tight tracking-tight text-foreground",
  h2: "text-xl font-semibold leading-tight text-foreground",
  section: "text-lg font-semibold leading-tight text-foreground",
  body: "text-base leading-normal text-foreground",
  caption: "text-sm leading-snug text-subtext",
  micro: "text-[11px] leading-snug text-subtext",
} as const;

export function typo(
  variant: keyof typeof typography,
  className?: string
): string {
  return cn(typography[variant], className);
}

export function lx(...classes: (string | undefined | false)[]) {
  return cn(classes);
}
