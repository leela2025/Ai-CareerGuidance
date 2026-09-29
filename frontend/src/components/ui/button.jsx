import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-zinc-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:via-brand-400 hover:to-accent-500 hover:shadow-brand-500/40 hover:-translate-y-0.5",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
        outline:
          "border border-zinc-800/80 bg-zinc-900/60 text-zinc-200 backdrop-blur-sm hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700",
        secondary:
          "bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700",
        ghost:
          "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
        link:
          "text-brand-400 underline-offset-4 hover:underline",
        subtle:
          "bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:bg-brand-500/20 hover:text-brand-200",
        glow:
          "relative overflow-hidden bg-gradient-to-r from-brand-600 via-fuchsia-600 to-accent-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 border border-white/20",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-13 rounded-2xl px-8 py-3.5 text-base font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
