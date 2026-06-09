import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import type { TrendDataPoint, CategoryData, TopProduct, DashboardStats } from "@/types";
import { ANALYTICS_TREND_DAYS, EXPIRY_WARNING_DAYS, ACTIVITY_FEED_LIMIT } from "@/constants/config";
import { getStockStatus, calculateDaysUntilExpiry } from "@/lib/utils";

export async function getDashboardStats(): Promise<DashboardStats> {
  const cacheKey = "dashboard:stats";
  const cached = await getCache<DashboardStats>(cacheKey);
  if (cached) return cached;

  const today = new Date();
  const warningCutoff = new Date(today);
  warningCutoff.setDate(today.getDate() + EXPIRY_WARNING_DAYS);

  const [
    totalProducts,
    totalSuppliers,
    products,
    recentLogs,
  ] = await prisma.$transaction([
    prisma.product.count(),
    prisma.supplier.count(),
    prisma.product.findMany({ select: { quantity: true, minStockLevel: true, expiryDate: true, price: true } }),
    prisma.inventoryLog.findMany({
      take: ACTIVITY_FEED_LIMIT,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const lowStockCount = products.filter(
    (p) => getStockStatus(p.quantity, p.minStockLevel) !== "ok"
  ).length;

  const expiringCount = products.filter((p) => {
    const days = calculateDaysUntilExpiry(p.expiryDate);
    return days !== null && days <= EXPIRY_WARNING_DAYS;
  }).length;

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price) * p.quantity,
    0
  );

  const stats: DashboardStats = {
    totalProducts,
    lowStockCount,
    expiringCount,
    totalSuppliers,
    totalValue,
    recentActivity: recentLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      product: log.product,
      user: log.user,
    })) as DashboardStats["recentActivity"],
  };

  await setCache(cacheKey, stats, 60);
  return stats;
}

export async function getInventoryTrends(days: number = ANALYTICS_TREND_DAYS): Promise<TrendDataPoint[]> {
  const cacheKey = `analytics:trends:${days}`;
  const cached = await getCache<TrendDataPoint[]>(cacheKey);
  if (cached) return cached;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.inventoryLog.findMany({
    where: { createdAt: { gte: startDate } },
    select: { type: true, quantity: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dateMap = new Map<string, { stockIn: number; stockOut: number }>();

  // Pre-fill all dates
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, { stockIn: 0, stockOut: 0 });
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().split("T")[0];
    const entry = dateMap.get(key) || { stockIn: 0, stockOut: 0 };
    if (log.type === "STOCK_IN") entry.stockIn += log.quantity;
    else entry.stockOut += log.quantity;
    dateMap.set(key, entry);
  }

  const result: TrendDataPoint[] = Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    stockIn: data.stockIn,
    stockOut: data.stockOut,
    net: data.stockIn - data.stockOut,
  }));

  await setCache(cacheKey, result, 300);
  return result;
}

export async function getCategoryDistribution(): Promise<CategoryData[]> {
  const cacheKey = "analytics:categories";
  const cached = await getCache<CategoryData[]>(cacheKey);
  if (cached) return cached;

  const results = await prisma.product.groupBy({
    by: ["category"],
    _count: { id: true },
    _sum: { price: true },
  });

  const data: CategoryData[] = results.map((r) => ({
    category: r.category,
    count: r._count.id,
    totalValue: Number(r._sum.price || 0),
  }));

  await setCache(cacheKey, data, 300);
  return data;
}

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  const cacheKey = `analytics:top-products:${limit}`;
  const cached = await getCache<TopProduct[]>(cacheKey);
  if (cached) return cached;

  const logs = await prisma.inventoryLog.groupBy({
    by: ["productId", "type"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
  });

  const productIds = [...new Set(logs.map((l) => l.productId))].slice(0, limit);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const result: TopProduct[] = productIds.map((id) => {
    const product = productMap.get(id);
    const inLogs = logs.filter((l) => l.productId === id && l.type === "STOCK_IN");
    const outLogs = logs.filter((l) => l.productId === id && l.type === "STOCK_OUT");
    const totalIn = inLogs.reduce((s, l) => s + (l._sum.quantity || 0), 0);
    const totalOut = outLogs.reduce((s, l) => s + (l._sum.quantity || 0), 0);

    return {
      productId: id,
      productName: product?.name || "Unknown",
      sku: product?.sku || "",
      totalMovements: totalIn + totalOut,
      totalIn,
      totalOut,
    };
  });

  await setCache(cacheKey, result, 300);
  return result;
}
