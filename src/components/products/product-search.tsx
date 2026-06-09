"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200",
      value
        ? "border-blue-500/40 bg-blue-500/5"
        : "border-white/[0.06] bg-slate-800/50 hover:border-white/10"
    )}>
      <Search className={cn("h-4 w-4 shrink-0 transition-colors", value ? "text-blue-400" : "text-slate-500")} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, SKU, or category…"
        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-400 transition-colors hover:bg-slate-600 hover:text-slate-200"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
