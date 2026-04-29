"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  format?: "currency" | "number";
  vertical?: boolean;
}

export function DDGBarChart({
  data,
  height = 280,
  format = "number",
  vertical = false,
}: BarChartProps) {
  const formatter = (value: number) =>
    format === "currency" ? formatCurrency(value) : formatCompact(value);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={vertical ? "vertical" : "horizontal"}
        margin={{ top: 10, right: 12, left: vertical ? 80 : -8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={vertical}
          horizontal={!vertical}
          opacity={0.5}
        />
        {vertical ? (
          <>
            <XAxis
              type="number"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatter}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={75}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatter}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--accent)", opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="rounded-lg border border-border bg-popover/95 backdrop-blur px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">{p.payload.name}</p>
                <p className="text-sm font-medium tabular-nums">
                  {formatter(Number(p.value))}
                </p>
              </div>
            );
          }}
        />
        <Bar
          dataKey="value"
          radius={[6, 6, 0, 0]}
          animationDuration={500}
        >
          {data.map((entry, idx) => (
            <Cell
              key={`c-${idx}`}
              fill={entry.color ?? "var(--ddg-orange)"}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
