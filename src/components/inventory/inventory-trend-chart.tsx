"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";

export function InventoryTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory/trend?days=30")
      .then((res) => res.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card flex h-[350px] flex-col rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">30-Day Movement Trend</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex h-[350px] flex-col rounded-2xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">30-Day Movement Trend</h3>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Stock In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Stock Out</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }} 
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-white/[0.08] bg-slate-900/95 p-3 shadow-xl backdrop-blur-xl">
                      <p className="mb-2 text-xs font-medium text-slate-400">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-slate-300">Stock In:</span>
                          <span className="font-semibold text-emerald-400 ml-auto">{payload[0].value}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="text-slate-300">Stock Out:</span>
                          <span className="font-semibold text-amber-400 ml-auto">{payload[1].value}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="stockIn"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockIn)"
              activeDot={{ r: 6, fill: "#10b981", stroke: "#0f172a", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="stockOut"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockOut)"
              activeDot={{ r: 6, fill: "#f59e0b", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
