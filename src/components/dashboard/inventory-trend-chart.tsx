"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

// Mock 30-day trend data
const data = [
  { date: "May 10", stockIn: 45, stockOut: 28 },
  { date: "May 12", stockIn: 32, stockOut: 41 },
  { date: "May 14", stockIn: 67, stockOut: 35 },
  { date: "May 16", stockIn: 28, stockOut: 52 },
  { date: "May 18", stockIn: 84, stockOut: 30 },
  { date: "May 20", stockIn: 55, stockOut: 46 },
  { date: "May 22", stockIn: 73, stockOut: 38 },
  { date: "May 24", stockIn: 42, stockOut: 61 },
  { date: "May 26", stockIn: 91, stockOut: 44 },
  { date: "May 28", stockIn: 38, stockOut: 29 },
  { date: "May 30", stockIn: 62, stockOut: 55 },
  { date: "Jun 1",  stockIn: 79, stockOut: 33 },
  { date: "Jun 3",  stockIn: 48, stockOut: 67 },
  { date: "Jun 5",  stockIn: 95, stockOut: 41 },
  { date: "Jun 7",  stockIn: 57, stockOut: 38 },
  { date: "Jun 9",  stockIn: 71, stockOut: 49 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-800/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-semibold text-slate-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-white">{p.value} units</span>
        </div>
      ))}
    </div>
  );
}

export function InventoryTrendChart() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Inventory Trends</h3>
          <p className="mt-0.5 text-xs text-slate-500">Stock movements over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "Stock In",  color: "#3b82f6" },
            { label: "Stock Out", color: "#8b5cf6" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[11px] text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="stockIn"
            name="Stock In"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradIn)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
          />
          <Area
            type="monotone"
            dataKey="stockOut"
            name="Stock Out"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradOut)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#8b5cf6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
