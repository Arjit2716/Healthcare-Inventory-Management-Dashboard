"use client";

import { useState, useEffect } from "react";
import type { Supplier } from "@/types";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/suppliers?all=true")
      .then((r) => r.json())
      .then((json) => setSuppliers(json.data ?? []))
      .catch(() => setSuppliers([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { suppliers, isLoading };
}
