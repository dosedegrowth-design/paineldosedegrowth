"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatNumber, formatPercent, isPositiveChange } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: "currency" | "number" | "percent";
  icon?: LucideIcon;
  metricKey?: string;
  subtitle?: string;
  highlight?: boolean;
  decimals?: number;
}

export function KPICard({
  label,
  value,
  previousValue,
  format = "number",
  icon: Icon,
  metricKey = "",
  subtitle,
  highlight = false,
  decimals = 0,
}: KPICardProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => {
    if (format === "currency") return formatCurrency(v);
    if (format === "percent") return formatPercent(v, decimals);
    return formatNumber(v, decimals);
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, motionValue]);

  // Delta
  let direction: "up" | "down" | "neutral" = "neutral";
  let deltaPct = 0;
  if (previousValue !== undefined && previousValue !== 0) {
    deltaPct = ((value - previousValue) / previousValue) * 100;
    direction = deltaPct > 0.1 ? "up" : deltaPct < -0.1 ? "down" : "neutral";
  }
  const isGood = isPositiveChange(metricKey, direction);

  return (
    <Card
      className={cn(
        "relative overflow-hidden group hover:border-[var(--ddg-orange)]/40 transition-all duration-200",
        highlight && "border-[var(--ddg-orange)]/30 ddg-glow"
      )}
    >
      {highlight && (
        <div className="absolute inset-0 ddg-gradient-subtle pointer-events-none" />
      )}
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center transition-colors",
                highlight
                  ? "bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)]"
                  : "bg-muted text-muted-foreground group-hover:bg-[var(--ddg-orange)]/10 group-hover:text-[var(--ddg-orange)]"
              )}
            >
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <motion.div className="text-3xl font-bold tabular-nums leading-tight">
          {rounded}
        </motion.div>
        <div className="mt-2 flex items-center gap-2">
          {previousValue !== undefined && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                direction === "neutral"
                  ? "text-muted-foreground"
                  : isGood
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {direction === "up" && <ArrowUpRight className="size-3" />}
              {direction === "down" && <ArrowDownRight className="size-3" />}
              {direction === "neutral" && <Minus className="size-3" />}
              <span>
                {direction !== "neutral" && (deltaPct > 0 ? "+" : "")}
                {Math.abs(deltaPct).toFixed(1)}%
              </span>
            </div>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
