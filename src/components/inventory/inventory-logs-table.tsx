"use client";

import { ArrowDownToLine, ArrowUpFromLine, User, Calendar, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { InventoryLog } from "@/types";

interface InventoryLogsTableProps {
  logs: InventoryLog[];
  isLoading: boolean;
}

export function InventoryLogsTable({ logs, isLoading }: InventoryLogsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              {["Date", "Product", "Movement", "Quantity", "User", "Notes"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="skeleton h-4 w-24 rounded" /></TableCell>
                <TableCell><div className="skeleton h-4 w-32 rounded" /></TableCell>
                <TableCell><div className="skeleton h-6 w-20 rounded-full" /></TableCell>
                <TableCell><div className="skeleton h-4 w-12 rounded" /></TableCell>
                <TableCell><div className="skeleton h-4 w-28 rounded" /></TableCell>
                <TableCell><div className="skeleton h-4 w-36 rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-16 text-center">
        <FileText className="h-10 w-10 text-slate-700" />
        <p className="mt-4 text-sm font-medium text-slate-400">No inventory logs found</p>
        <p className="mt-1 text-xs text-slate-600">
          Try adjusting your filters or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Movement</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isStockIn = log.type === "STOCK_IN";
            return (
              <TableRow key={log.id} className="group">
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-200">{log.product.name}</p>
                    <p className="text-[10px] text-slate-500">{log.product.sku}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
                    isStockIn 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  )}>
                    {isStockIn ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
                    {isStockIn ? "Stock In" : "Stock Out"}
                  </span>
                </TableCell>
                
                <TableCell className="text-right whitespace-nowrap">
                  <p className={cn(
                    "font-bold font-mono text-sm",
                    isStockIn ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {isStockIn ? "+" : "-"}{log.quantity}
                  </p>
                  <p className="text-[10px] text-slate-500">{log.product.unit}</p>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-white/[0.05]">
                      {log.user.name[0]?.toUpperCase() ?? <User className="h-3 w-3" />}
                    </div>
                    <span className="truncate max-w-[120px]">{log.user.name}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="line-clamp-2 text-xs text-slate-500" title={log.notes ?? ""}>
                    {log.notes || "—"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
