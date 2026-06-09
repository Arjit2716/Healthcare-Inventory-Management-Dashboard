"use client";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";

const data = [
  { name: "Antibiotics",     value: 24, color: "#3b82f6" },
  { name: "Analgesics",      value: 18, color: "#8b5cf6" },
  { name: "Diabetes",        value: 15, color: "#06b6d4" },
  { name: "Cardiovascular",  value: 12, color: "#10b981" },
  { name: "PPE",             value: 16, color: "#f59e0b" },
  { name: "Equipment",       value: 8,  color: "#f97316" },
  { name: "Vaccines",        value: 7,  color: "#ec4899" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-800/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.payload.color }} />
        <span className="text-xs font-semibold text-slate-200">{p.name}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-white">{p.value} products</p>
      <p className="text-[10px] text-slate-500">
        {((p.value / total) * 100).toFixed(1)}% of inventory
      </p>
    </div>
  );
}

function CustomLegend() {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="mt-4 space-y-2">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{d.name}</span>
          <span className="text-xs font-semibold text-slate-300">{d.value}</span>
          <span className="w-8 text-right text-[10px] text-slate-600">
            {((d.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function CategoryDistributionChart() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Category Distribution</h3>
        <p className="mt-0.5 text-xs text-slate-500">Products by medical category</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                opacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* Center label — purely decorative */}
        </PieChart>
      </ResponsiveContainer>

      <CustomLegend />
    </div>
  );
}
