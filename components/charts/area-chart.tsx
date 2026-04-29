"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Array<{
    key: string;
    label: string;
    color: string;
    format?: "currency" | "number" | "percent";
  }>;
  height?: number;
  stacked?: boolean;
}

export function DDGAreaChart({
  data,
  xKey,
  series,
  height = 280,
  stacked = false,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`grad-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
          opacity={0.5}
        />
        <XAxis
          dataKey={xKey}
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompact(v)}
        />
        <Tooltip content={<CustomTooltip series={series} />} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            stackId={stacked ? "1" : undefined}
            animationDuration={500}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: string;
  series: AreaChartProps["series"];
}

function CustomTooltip({ active, payload, label, series }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = label ? new Date(label) : null;
  const dateStr = d
    ? d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="rounded-lg border border-border bg-popover/95 backdrop-blur px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1.5">{dateStr}</p>
      <div className="space-y-1">
        {payload.map((p) => {
          const s = series.find((ss) => ss.key === p.dataKey);
          const fmt = s?.format ?? "number";
          const val =
            fmt === "currency"
              ? formatCurrency(p.value)
              : fmt === "percent"
              ? `${p.value.toFixed(2)}%`
              : new Intl.NumberFormat("pt-BR").format(p.value);
          return (
            <div
              key={p.dataKey}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="size-2 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-muted-foreground">{p.name}:</span>
              <span className="font-medium tabular-nums">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
