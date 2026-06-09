import { prisma } from "@/lib/prisma";
import { getCache, setCache, invalidatePattern } from "@/lib/redis";
import type { StockMovementInput } from "@/validations/inventory.schema";
import type { InventoryLog, PaginatedResponse } from "@/types";

function serializeLog(log: Record<string, unknown>): InventoryLog {
  return {
    ...log,
    createdAt: (log.createdAt as Date).toISOString(),
    product: { ...(log.product as Record<string, unknown>) },
    user:    { ...(log.user    as Record<string, unknown>) },
  } as InventoryLog;
}

// ── Get paginated inventory logs with rich filters ─────────────────────────
export async function getInventoryLogs(
  productId?: string,
  type?: "STOCK_IN" | "STOCK_OUT",
  page = 1,
  limit = 20,
  search?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<PaginatedResponse<InventoryLog>> {
  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (type)      where.type = type;
  if (search) {
    where.OR = [
      { product: { name: { contains: search, mode: "insensitive" } } },
      { product: { sku:  { contains: search, mode: "insensitive" } } },
      { notes:   { contains: search, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
    };
  }

  const [rawLogs, total] = await prisma.$transaction([
    prisma.inventoryLog.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user:    { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryLog.count({ where }),
  ]);

  return {
    data: rawLogs.map(serializeLog),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Quantity history for a product (reconstructed from logs) ───────────────
export async function getQuantityHistory(productId: string) {
  const [product, logs] = await Promise.all([
    prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: { id: true, name: true, sku: true, unit: true, quantity: true, minStockLevel: true },
    }),
    prisma.inventoryLog.findMany({
      where:   { productId },
      orderBy: { createdAt: "asc" },
      select:  { type: true, quantity: true, createdAt: true },
    }),
  ]);

  // Walk logs backwards from current qty to reconstruct history
  let running = product.quantity;
  const history: { date: string; quantity: number; type: string; change: number }[] = [];

  // Build reversed timeline
  const reversed = [...logs].reverse();
  for (const log of reversed) {
    history.unshift({
      date:     log.createdAt.toISOString(),
      quantity: running,
      type:     log.type,
      change:   log.type === "STOCK_IN" ? log.quantity : -log.quantity,
    });
    running = log.type === "STOCK_IN" ? running - log.quantity : running + log.quantity;
  }

  return {
    product: {
      ...product,
      quantity: product.quantity,
    },
    history,
    minStockLevel: product.minStockLevel,
  };
}

// ── Inventory summary stats ────────────────────────────────────────────────
export async function getInventorySummary() {
  const cacheKey = "inventory:summary";
  const cached   = await getCache<Record<string, unknown>>(cacheKey);
  if (cached) return cached;

  const today  = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

  const [totalIn, totalOut, weekIn, weekOut, logCount, recentLogs] =
    await prisma.$transaction([
      prisma.inventoryLog.aggregate({
        where: { type: "STOCK_IN" },
        _sum: { quantity: true },
      }),
      prisma.inventoryLog.aggregate({
        where: { type: "STOCK_OUT" },
        _sum: { quantity: true },
      }),
      prisma.inventoryLog.aggregate({
        where: { type: "STOCK_IN",  createdAt: { gte: weekAgo } },
        _sum: { quantity: true },
      }),
      prisma.inventoryLog.aggregate({
        where: { type: "STOCK_OUT", createdAt: { gte: weekAgo } },
        _sum: { quantity: true },
      }),
      prisma.inventoryLog.count(),
      prisma.inventoryLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          user:    { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

  const result = {
    totalStockIn:    totalIn._sum.quantity  ?? 0,
    totalStockOut:   totalOut._sum.quantity ?? 0,
    weekStockIn:     weekIn._sum.quantity   ?? 0,
    weekStockOut:    weekOut._sum.quantity  ?? 0,
    totalMovements:  logCount,
    recentLogs:      recentLogs.map(serializeLog),
  };

  await setCache(cacheKey, result, 60); // 1-min cache
  return result;
}

// ── Daily trend for area chart (last N days) ───────────────────────────────
export async function getInventoryTrend(days = 30) {
  const cacheKey = `inventory:trend:${days}`;
  const cached   = await getCache<unknown[]>(cacheKey);
  if (cached) return cached;

  const from = new Date();
  from.setDate(from.getDate() - days);

  const logs = await prisma.inventoryLog.findMany({
    where:   { createdAt: { gte: from } },
    select:  { type: true, quantity: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dayMap = new Map<string, { stockIn: number; stockOut: number }>();
  for (let i = 0; i <= days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { stockIn: 0, stockOut: 0 });
  }
  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const day = dayMap.get(key);
    if (!day) continue;
    if (log.type === "STOCK_IN")  day.stockIn  += log.quantity;
    else                          day.stockOut += log.quantity;
  }

  const result = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    label:    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    stockIn:  v.stockIn,
    stockOut: v.stockOut,
    net:      v.stockIn - v.stockOut,
  }));

  await setCache(cacheKey, result, 120);
  return result;
}

// ── Create stock movement (atomic) ─────────────────────────────────────────
export async function createStockMovement(
  data: StockMovementInput,
  userId: string,
): Promise<InventoryLog> {
  const { productId, type, quantity, notes } = data;

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  if (type === "STOCK_OUT" && product.quantity < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.quantity} ${product.unit}`);
  }

  const newQuantity = type === "STOCK_IN"
    ? product.quantity + quantity
    : product.quantity - quantity;

  const [log] = await prisma.$transaction([
    prisma.inventoryLog.create({
      data:    { productId, userId, type, quantity, notes },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user:    { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data:  { quantity: newQuantity },
    }),
  ]);

  // Invalidate caches
  await Promise.all([
    invalidatePattern("products:*"),
    invalidatePattern("analytics:*"),
    invalidatePattern("dashboard:*"),
    invalidatePattern("inventory:*"),
  ]);

  // Auto-alert if stock is low after movement
  if (newQuantity <= product.minStockLevel) {
    const severity =
      newQuantity === 0                           ? "CRITICAL" :
      newQuantity <= product.minStockLevel * 0.3  ? "CRITICAL" : "HIGH";

    await prisma.alert.upsert({
      where:  { id: `low-stock-${productId}` },
      update: {
        isRead: false, severity,
        message: `${product.name} stock is low (${newQuantity} remaining, min: ${product.minStockLevel})`,
      },
      create: {
        id: `low-stock-${productId}`,
        productId, type: "LOW_STOCK", severity,
        message: `${product.name} stock is low (${newQuantity} remaining, min: ${product.minStockLevel})`,
      },
    }).catch(() => {});
  }

  return serializeLog(log as Record<string, unknown>);
}
