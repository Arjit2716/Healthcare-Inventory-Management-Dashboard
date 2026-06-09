import { prisma } from "@/lib/prisma";
import { invalidatePattern } from "@/lib/redis";
import type { Alert, PaginatedResponse } from "@/types";
import { EXPIRY_WARNING_DAYS } from "@/constants/config";

function serializeAlert(a: Record<string, unknown>): Alert {
  return {
    ...a,
    createdAt: (a.createdAt as Date).toISOString(),
    updatedAt: (a.updatedAt as Date).toISOString(),
    product: { ...(a.product as Record<string, unknown>) },
  } as Alert;
}

export async function getAlerts(
  type?: "LOW_STOCK" | "EXPIRY",
  isRead?: boolean,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Alert>> {
  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead;

  const [rawAlerts, total] = await prisma.$transaction([
    prisma.alert.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.alert.count({ where }),
  ]);

  return {
    data: rawAlerts.map(serializeAlert),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUnreadCount(): Promise<number> {
  return prisma.alert.count({ where: { isRead: false } });
}

export async function markAlertRead(id: string): Promise<Alert> {
  const alert = await prisma.alert.update({
    where: { id },
    data: { isRead: true },
    include: {
      product: { select: { id: true, name: true, sku: true, category: true } },
    },
  });
  return serializeAlert(alert as Record<string, unknown>);
}

export async function markAllRead(): Promise<void> {
  await prisma.alert.updateMany({ data: { isRead: true } });
}

export async function refreshAlerts(): Promise<void> {
  const today = new Date();
  const warningCutoff = new Date(today);
  warningCutoff.setDate(today.getDate() + EXPIRY_WARNING_DAYS);

  // Find expiring products
  const expiringProducts = await prisma.product.findMany({
    where: {
      expiryDate: { not: null, lte: warningCutoff },
    },
    select: { id: true, name: true, expiryDate: true },
  });

  for (const product of expiringProducts) {
    if (!product.expiryDate) continue;
    const daysLeft = Math.ceil(
      (product.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const severity = daysLeft <= 0 ? "CRITICAL" : daysLeft <= 7 ? "CRITICAL" : daysLeft <= 14 ? "HIGH" : "MEDIUM";

    await prisma.alert.upsert({
      where: { id: `expiry-${product.id}` },
      update: {
        message: daysLeft <= 0
          ? `${product.name} has EXPIRED`
          : `${product.name} expires in ${daysLeft} days`,
        severity,
        isRead: false,
        updatedAt: new Date(),
      },
      create: {
        id: `expiry-${product.id}`,
        productId: product.id,
        type: "EXPIRY",
        severity,
        message: daysLeft <= 0
          ? `${product.name} has EXPIRED`
          : `${product.name} expires in ${daysLeft} days`,
      },
    }).catch(() => {});
  }

  // Find low-stock products
  const lowStockProducts = await prisma.product.findMany({
    select: { id: true, name: true, quantity: true, minStockLevel: true },
  });

  for (const product of lowStockProducts) {
    if (product.quantity <= product.minStockLevel) {
      const severity = product.quantity === 0 ? "CRITICAL" : product.quantity <= product.minStockLevel * 0.3 ? "CRITICAL" : "HIGH";
      await prisma.alert.upsert({
        where: { id: `low-stock-${product.id}` },
        update: {
          message: `${product.name} stock is low (${product.quantity} remaining, min: ${product.minStockLevel})`,
          severity,
          isRead: false,
          updatedAt: new Date(),
        },
        create: {
          id: `low-stock-${product.id}`,
          productId: product.id,
          type: "LOW_STOCK",
          severity,
          message: `${product.name} stock is low (${product.quantity} remaining, min: ${product.minStockLevel})`,
        },
      }).catch(() => {});
    }
  }

  await invalidatePattern("alerts:*");
}
