"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { InventoryLog, PaginatedResponse } from "@/types";

interface InventorySummary {
  totalStockIn: number;
  totalStockOut: number;
  weekStockIn: number;
  weekStockOut: number;
  totalMovements: number;
  recentLogs: InventoryLog[];
}

export function useInventory() {
  const [data, setData] = useState<PaginatedResponse<InventoryLog> | null>(null);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState("");
  const [type, setType] = useState<"ALL" | "STOCK_IN" | "STOCK_OUT">("ALL");
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch paginated logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (type !== "ALL") params.set("type", type);
      if (dateRange.from) params.set("dateFrom", dateRange.from);
      if (dateRange.to) params.set("dateTo", dateRange.to);

      const res = await fetch(`/api/inventory?${params}`);
      if (!res.ok) throw new Error("Failed to load inventory logs");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, type, dateRange]);

  // Fetch summary stats
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/summary");
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data);
      }
    } catch {
      // Non-critical, ignore
    }
  }, []);

  // Debounced fetch for logs
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchLogs(), 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [fetchLogs]);

  // Initial summary fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const setSearch = (v: string) => { setSearchState(v); setPage(1); };
  const setTypeFilter = (t: "ALL" | "STOCK_IN" | "STOCK_OUT") => { setType(t); setPage(1); };
  
  const refresh = async () => {
    await Promise.all([fetchLogs(), fetchSummary()]);
  };

  return {
    logs: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    summary,
    page, search, type, dateRange, isLoading, error,
    setPage, setSearch, setType: setTypeFilter, setDateRange, refresh,
  };
}
