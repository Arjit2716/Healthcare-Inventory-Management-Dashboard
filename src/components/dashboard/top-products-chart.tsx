"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";

const data = [
  { name: "Amoxicillin 500mg",    movements: 192, color: "#3b82f6" },
  { name: "Paracetamol 1000mg",   movements: 168, color: "#8b5cf6" },
  { name: "Surgical Gloves",      movements: 155, color: "#06b6d4" },
  { name: "Syringe 5ml",          movements: 143, color: "#10b981" },
  { name: "Ibuprofen 400mg",      movements: 121, color: "#f59e0b" },
  { name: "Metformin 500mg",      movements: 98,  color: "#f97316" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string; color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-800/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs text-slate-400">{p.payload.name}</p>
      <p className="mt-0.5 text-sm font-bold text-white">{p.value} movements</p>
    </div>
  );
}

export function TopProductsChart() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Top Products by Movement</h3>
        <p className="mt-0.5 text-xs text-slate-500">Most active products this month</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barSize={10}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 9, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={110}
            tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 16) + "…" : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="movements" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
