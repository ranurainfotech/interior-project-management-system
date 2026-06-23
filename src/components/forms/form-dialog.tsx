"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormDialogProps {
  trigger: ReactElement;
  title: string;
  description?: string;
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
  onOpenChange?: (open: boolean) => void;
}

export function FormDialog({
  trigger,
  title,
  description,
  children,
  onOpenChange,
}: FormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const close = () => handleOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md"
        showCloseButton
      >
        <div className="border-b border-border px-5 pb-4 pt-5 pr-12">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-lg font-semibold leading-tight">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm leading-snug text-subtext">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
        </div>
        {typeof children === "function" ? children({ close }) : children}
      </DialogContent>
    </Dialog>
  );
}
