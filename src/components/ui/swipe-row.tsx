"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

const THRESHOLD = 72;

export function SwipeRow({
  children,
  onEdit,
  onDelete,
  onClick,
  className,
}: SwipeRowProps) {
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const rightOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD && onEdit) onEdit();
    else if (info.offset.x < -THRESHOLD && onDelete) onDelete();
    x.set(0);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-[20px]", className)}>
      {onEdit && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 left-0 flex w-20 items-center justify-center bg-primary text-white"
        >
          <Pencil className="h-5 w-5" />
        </motion.div>
      )}
      {onDelete && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-danger text-white"
        >
          <Trash2 className="h-5 w-5" />
        </motion.div>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={() => onClick?.()}
        className={cn(
          "relative flex h-[90px] items-center gap-3 rounded-[20px] bg-card px-4 shadow-card",
          onClick && "cursor-pointer active:bg-muted/30"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
        <ChevronRight className="h-5 w-5 shrink-0 text-subtext" />
      </motion.div>
    </div>
  );
}
