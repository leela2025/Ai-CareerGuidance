import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-brand-600 text-white shadow hover:bg-brand-500",
        secondary:
          "border border-zinc-700 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700",
        destructive:
          "border border-transparent bg-rose-600 text-white shadow hover:bg-rose-500",
        outline:
          "border border-zinc-700 text-zinc-300 bg-transparent",
        brand:
          "border border-brand-500/30 bg-brand-500/10 text-brand-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
        accent:
          "border border-accent-500/30 bg-accent-500/10 text-accent-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        emerald:
          "border border-brand-500/30 bg-brand-500/10 text-brand-300 shadow-[0_0_15px_rgba(45,106,79,0.25)]",
        amber:
          "border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
