import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        warning:
          "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        danger:
          "border-transparent bg-red-500/20 text-red-400 border-red-500/30",
        info:
          "border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30",
        ddg:
          "border-transparent bg-[var(--ddg-orange)]/15 text-[var(--ddg-orange)] border-[var(--ddg-orange)]/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
