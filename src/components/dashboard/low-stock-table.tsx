import { AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LOW_STOCK = [
  { sku: "MED-AMX-500", name: "Amoxicillin 500mg", category: "Antibiotics",     qty: 8,   min: 50,  unit: "capsules", pct: 16  },
  { sku: "MED-IBU-400", name: "Ibuprofen 400mg",   category: "Analgesics",      qty: 5,   min: 75,  unit: "tablets",  pct: 7   },
  { sku: "SUP-GLV-MED", name: "Surgical Gloves",   category: "PPE",             qty: 45,  min: 100, unit: "pairs",    pct: 45  },
  { sku: "EQP-OXI-PUL", name: "Pulse Oximeter",    category: "Equipment",       qty: 3,   min: 8,   unit: "units",    pct: 38  },
  { sku: "VAC-FLU-INF", name: "Influenza Vaccine",  category: "Vaccines",       qty: 6,   min: 20,  unit: "vials",    pct: 30  },
];

function StockBar({ pct }: { pct: number }) {
  const color = pct < 20 ? "bg-red-500" : pct < 40 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="progress-bar w-24">
      <div className={cn("progress-fill", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function LowStockTable() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Low Stock Items</h3>
          <p className="mt-0.5 text-xs text-slate-500">Products below minimum threshold</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200">
          Reorder all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Product", "Category", "Stock", "Min", "Level", ""].map((h) => (
                <th key={h} className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {LOW_STOCK.map((item) => (
              <tr key={item.sku} className="group transition-colors hover:bg-slate-800/20">
                <td className="py-3 pr-4">
                  <div>
                    <p className="font-medium text-slate-200 truncate max-w-[140px]">{item.name}</p>
                    <p className="text-[10px] text-slate-600">{item.sku}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-400">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={cn(
                    "font-bold",
                    item.pct < 20 ? "text-red-400" : item.pct < 40 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {item.qty}
                  </span>
                  <span className="ml-1 text-[10px] text-slate-600">{item.unit}</span>
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs">{item.min}</td>
                <td className="py-3 pr-4">
                  <StockBar pct={item.pct} />
                </td>
                <td className="py-3">
                  <button className="flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[10px] font-medium text-blue-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-500/10">
                    Reorder
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
