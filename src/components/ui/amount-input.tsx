"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatNumberWithCommas, stripNumberFormatting } from "@/lib/format";

interface AmountInputProps
  extends Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange" | "inputMode"> {
  value: string;
  onValueChange: (value: string) => void;
}

export function AmountInput({
  value,
  onValueChange,
  ...props
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = stripNumberFormatting(e.target.value);
    onValueChange(digits ? formatNumberWithCommas(digits) : "");
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}
