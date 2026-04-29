"use client";

import { motion } from "framer-motion";
import { formatCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FunnelStep {
  label: string;
  value: number;
  color?: string;
  rate?: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

export function DDGFunnelChart({ steps }: FunnelChartProps) {
  const max = Math.max(...steps.map((s) => s.value));

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const widthPct = (step.value / max) * 100;
        const prevValue = idx > 0 ? steps[idx - 1].value : null;
        const dropoffPct =
          prevValue !== null && prevValue > 0
            ? ((prevValue - step.value) / prevValue) * 100
            : 0;

        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{step.label}</span>
              <div className="flex items-center gap-3 tabular-nums">
                <span className="text-muted-foreground">
                  {formatCompact(step.value)}
                </span>
                {idx > 0 && dropoffPct > 0 && (
                  <span className="text-[10px] text-red-400">
                    -{dropoffPct.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-9 rounded-lg bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-lg flex items-center justify-end pr-3",
                  step.color ?? "bg-gradient-to-r from-[var(--ddg-orange)] to-[var(--ddg-orange-light)]"
                )}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-foreground/80">
                  {step.rate !== undefined && (
                    <>{(step.rate * 100).toFixed(2)}%</>
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
