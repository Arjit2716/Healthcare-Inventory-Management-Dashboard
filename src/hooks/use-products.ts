"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Product, PaginatedResponse } from "@/types";

interface ProductFilters {
  search: string;
  category: string;
  stockStatus: string;
  supplierId: string;
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: "all",
  stockStatus: "all",
  supplierId: "",
  page: 1,
  limit: 10,
};

export function useProducts() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (f: ProductFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.search)      params.set("search",      f.search);
      if (f.category && f.category !== "all") params.set("category", f.category);
      if (f.stockStatus && f.stockStatus !== "all") params.set("stockStatus", f.stockStatus);
      if (f.supplierId)  params.set("supplierId",  f.supplierId);
      params.set("page",  String(f.page));
      params.set("limit", String(f.limit));

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search, immediate for other filters
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchProducts(filters), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [filters, fetchProducts]);

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search, page: 1 }));

  const setCategory = (category: string) =>
    setFilters((f) => ({ ...f, category, page: 1 }));

  const setStockStatus = (stockStatus: string) =>
    setFilters((f) => ({ ...f, stockStatus, page: 1 }));

  const setPage = (page: number) =>
    setFilters((f) => ({ ...f, page }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const refresh = () => fetchProducts(filters);

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    page: filters.page,
    isLoading,
    error,
    filters,
    setSearch,
    setCategory,
    setStockStatus,
    setPage,
    resetFilters,
    refresh,
  };
}
