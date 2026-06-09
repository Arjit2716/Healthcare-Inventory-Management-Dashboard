import { prisma } from "@/lib/prisma";
import { invalidatePattern } from "@/lib/redis";
import type { StockMovementInput } from "@/validations/inventory.schema";
import type { InventoryLog, PaginatedResponse } from "@/types";

function serializeLog(log: Record<string, unknown>): InventoryLog {
  return {
    ...log,
    createdAt: (log.createdAt as Date).toISOString(),
    product: {
      ...(log.product as Record<string, unknown>),
    },
    user: {
      ...(log.user as Record<string, unknown>),
    },
  } as InventoryLog;
}

export async function getInventoryLogs(
  productId?: string,
  type?: "STOCK_IN" | "STOCK_OUT",
  page = 1,
  limit = 20
): Promise<PaginatedResponse<InventoryLog>> {
  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (type) where.type = type;

  const [rawLogs, total] = await prisma.$transaction([
    prisma.inventoryLog.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user: { select: { id: true, name: true, email: true } },
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

export async function createStockMovement(
  data: StockMovementInput,
  userId: string
): Promise<InventoryLog> {
  const { productId, type, quantity, notes } = data;

  // Get current product
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  if (type === "STOCK_OUT" && product.quantity < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.quantity} ${product.unit}`);
  }

  const newQuantity = type === "STOCK_IN"
    ? product.quantity + quantity
    : product.quantity - quantity;

  // Atomic: update product quantity + create log
  const [log] = await prisma.$transaction([
    prisma.inventoryLog.create({
      data: { productId, userId, type, quantity, notes },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    }),
  ]);

  // Invalidate product and analytics caches
  await invalidatePattern("products:*");
  await invalidatePattern("analytics:*");
  await invalidatePattern("dashboard:*");

  // Auto-alert if new quantity is low
  if (newQuantity <= product.minStockLevel) {
    const severity = newQuantity === 0 ? "CRITICAL" : newQuantity <= product.minStockLevel * 0.3 ? "CRITICAL" : "HIGH";
    await prisma.alert.upsert({
      where: { id: `low-stock-${productId}` },
      update: { isRead: false, severity, message: `${product.name} stock is low (${newQuantity} remaining, min: ${product.minStockLevel})` },
      create: {
        id: `low-stock-${productId}`,
        productId,
        type: "LOW_STOCK",
        severity,
        message: `${product.name} stock is low (${newQuantity} remaining, min: ${product.minStockLevel})`,
      },
    }).catch(() => {});
  }

  return serializeLog(log as Record<string, unknown>);
}
