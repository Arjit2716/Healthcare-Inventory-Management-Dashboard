import { prisma } from "@/lib/prisma";
import { getCache, setCache, invalidatePattern } from "@/lib/redis";
import { getStockStatus, calculateDaysUntilExpiry } from "@/lib/utils";
import type { CreateProductInput, UpdateProductInput, ProductFilterInput } from "@/validations/product.schema";
import type { Product, PaginatedResponse } from "@/types";
import { EXPIRY_WARNING_DAYS } from "@/constants/config";

const CACHE_PREFIX = "products";

function enrichProduct(p: Record<string, unknown> & { quantity: number; minStockLevel: number; expiryDate: Date | null }): Product {
  const daysUntilExpiry = calculateDaysUntilExpiry(p.expiryDate as Date | null);
  return {
    ...p,
    price: Number(p.price),
    expiryDate: p.expiryDate ? (p.expiryDate as Date).toISOString() : null,
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
    supplier: {
      ...(p.supplier as Record<string, unknown>),
      createdAt: ((p.supplier as Record<string, unknown>).createdAt as Date).toISOString(),
      updatedAt: ((p.supplier as Record<string, unknown>).updatedAt as Date).toISOString(),
    },
    stockStatus: getStockStatus(p.quantity, p.minStockLevel),
    daysUntilExpiry,
  } as Product;
}

export async function getProducts(
  filters: ProductFilterInput
): Promise<PaginatedResponse<Product>> {
  const { search, category, stockStatus, supplierId, page = 1, limit = 20 } = filters;
  const cacheKey = `${CACHE_PREFIX}:list:${JSON.stringify(filters)}`;

  const cached = await getCache<PaginatedResponse<Product>>(cacheKey);
  if (cached) return cached;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category && category !== "all") where.category = category;
  if (supplierId) where.supplierId = supplierId;

  const [rawProducts, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { supplier: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  let products = rawProducts.map((p) => enrichProduct(p as Parameters<typeof enrichProduct>[0]));

  // Apply stock status filter in memory (derived field)
  if (stockStatus && stockStatus !== "all") {
    products = products.filter((p) => p.stockStatus === stockStatus);
  }

  const result: PaginatedResponse<Product> = {
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  await setCache(cacheKey, result);
  return result;
}

export async function getProductById(id: string): Promise<Product | null> {
  const cacheKey = `${CACHE_PREFIX}:${id}`;
  const cached = await getCache<Product>(cacheKey);
  if (cached) return cached;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });

  if (!product) return null;
  const enriched = enrichProduct(product as Parameters<typeof enrichProduct>[0]);
  await setCache(cacheKey, enriched);
  return enriched;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      price: data.price,
    },
    include: { supplier: true },
  });

  await invalidatePattern(`${CACHE_PREFIX}:*`);

  // Auto-generate alert if low stock
  if (product.quantity <= product.minStockLevel) {
    await generateLowStockAlert(product.id, product.name, product.quantity, product.minStockLevel);
  }

  return enrichProduct(product as Parameters<typeof enrichProduct>[0]);
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
    include: { supplier: true },
  });

  await invalidatePattern(`${CACHE_PREFIX}:*`);
  return enrichProduct(product as Parameters<typeof enrichProduct>[0]);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
  await invalidatePattern(`${CACHE_PREFIX}:*`);
}

export async function getCategories(): Promise<string[]> {
  const cacheKey = `${CACHE_PREFIX}:categories`;
  const cached = await getCache<string[]>(cacheKey);
  if (cached) return cached;

  const cats = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const result = cats.map((c) => c.category);
  await setCache(cacheKey, result, 600);
  return result;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    include: { supplier: true },
    orderBy: { quantity: "asc" },
  });

  return products
    .map((p) => enrichProduct(p as Parameters<typeof enrichProduct>[0]))
    .filter((p) => p.stockStatus === "low" || p.stockStatus === "critical" || p.stockStatus === "out");
}

export async function getExpiringProducts(days: number = EXPIRY_WARNING_DAYS): Promise<Product[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  const products = await prisma.product.findMany({
    where: {
      expiryDate: {
        not: null,
        lte: cutoffDate,
      },
    },
    include: { supplier: true },
    orderBy: { expiryDate: "asc" },
  });

  return products.map((p) => enrichProduct(p as Parameters<typeof enrichProduct>[0]));
}

async function generateLowStockAlert(
  productId: string,
  productName: string,
  quantity: number,
  minStockLevel: number
): Promise<void> {
  const severity = quantity === 0 ? "CRITICAL" : quantity <= minStockLevel * 0.3 ? "CRITICAL" : "HIGH";
  await prisma.alert.upsert({
    where: {
      id: `low-stock-${productId}`,
    },
    update: {
      message: `${productName} stock is critically low (${quantity} remaining, min: ${minStockLevel})`,
      severity,
      isRead: false,
    },
    create: {
      id: `low-stock-${productId}`,
      productId,
      type: "LOW_STOCK",
      severity,
      message: `${productName} stock is critically low (${quantity} remaining, min: ${minStockLevel})`,
    },
  }).catch(() => {
    // ID collision fine, upsert handles it
  });
}
