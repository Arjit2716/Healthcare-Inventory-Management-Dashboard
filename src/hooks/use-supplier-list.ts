"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Supplier, PaginatedResponse } from "@/types";

export function useSupplierList() {
  const [data, setData]     = useState<PaginatedResponse<Supplier> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [search, setSearchState] = useState("");
  const [page, setPage]     = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuppliers = useCallback(async (q: string, p: number) => {
    setIsLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "12" });
      if (q) params.set("search", q);
      const res = await fetch(`/api/suppliers?${params}`);
      if (!res.ok) throw new Error("Failed to load suppliers");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchSuppliers(search, page), 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search, page, fetchSuppliers]);

  const setSearch = (v: string) => { setSearchState(v); setPage(1); };
  const refresh   = ()           => fetchSuppliers(search, page);

  return {
    suppliers: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    page, search, isLoading, error,
    setSearch, setPage, refresh,
  };
}
