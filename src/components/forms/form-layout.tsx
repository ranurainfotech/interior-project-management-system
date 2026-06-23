"use client";

import type { ReactNode } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const formInputClass =
  "h-12 rounded-2xl border-border bg-card px-4 text-base shadow-card";

export const formSelectTriggerClass = cn(formInputClass, "w-full");

export const formTextareaClass =
  "min-h-[88px] resize-none rounded-2xl border-border bg-card px-4 py-3 text-base shadow-card";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-snug text-subtext">{hint}</p> : null}
    </div>
  );
}

export function FormStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-5", className)}>{children}</div>;
}

export function FormEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted/40 px-4 py-8 text-center">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm leading-snug text-subtext">{description}</p>
      </div>
      {action}
    </div>
  );
}

interface FormDialogFooterProps {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  cancelLabel?: string;
}

export function FormDialogFooter({
  label,
  loading,
  loadingLabel,
  cancelLabel = "Cancel",
}: FormDialogFooterProps) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end">
      <DialogClose
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-border bg-card"
            disabled={loading}
          />
        }
      >
        {cancelLabel}
      </DialogClose>
      <Button
        type="submit"
        className="h-11 rounded-xl font-semibold"
        disabled={loading}
      >
        {loading ? (loadingLabel ?? "Saving...") : label}
      </Button>
    </div>
  );
}
