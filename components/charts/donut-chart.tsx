"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  format?: "currency" | "number" | "percent";
}

export function DDGDonutChart({
  data,
  height = 280,
  centerLabel,
  centerValue,
  format = "number",
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="90%"
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            animationDuration={500}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              const v = Number(p.value);
              const formatted =
                format === "currency"
                  ? formatCurrency(v)
                  : new Intl.NumberFormat("pt-BR").format(v);
              return (
                <div className="rounded-lg border border-border bg-popover/95 backdrop-blur px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: p.payload.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {p.payload.name}
                    </span>
                  </div>
                  <p className="text-sm font-medium tabular-nums mt-1">
                    {formatted}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({formatPercent((v / total) * 100, 1)})
                    </span>
                  </p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {centerLabel}
            </span>
          )}
          {centerValue && (
            <span className="text-2xl font-bold tabular-nums">
              {centerValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
