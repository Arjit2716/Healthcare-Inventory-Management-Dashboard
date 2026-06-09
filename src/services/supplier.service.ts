import { prisma } from "@/lib/prisma";
import { getCache, setCache, invalidatePattern } from "@/lib/redis";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/validations/supplier.schema";
import type { Supplier, PaginatedResponse } from "@/types";

const CACHE_PREFIX = "suppliers";

function serializeSupplier(s: Record<string, unknown>): Supplier {
  return {
    ...s,
    createdAt: (s.createdAt as Date).toISOString(),
    updatedAt: (s.updatedAt as Date).toISOString(),
  } as Supplier;
}

export async function getSuppliers(
  search?: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Supplier>> {
  const cacheKey = `${CACHE_PREFIX}:list:${search}:${page}:${limit}`;
  const cached = await getCache<PaginatedResponse<Supplier>>(cacheKey);
  if (cached) return cached;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { contactPerson: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [rawSuppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  const result: PaginatedResponse<Supplier> = {
    data: rawSuppliers.map(serializeSupplier),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  await setCache(cacheKey, result);
  return result;
}

export async function getAllSuppliers(): Promise<Supplier[]> {
  const cacheKey = `${CACHE_PREFIX}:all`;
  const cached = await getCache<Supplier[]>(cacheKey);
  if (cached) return cached;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  const result = suppliers.map(serializeSupplier);
  await setCache(cacheKey, result, 600);
  return result;
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const cacheKey = `${CACHE_PREFIX}:${id}`;
  const cached = await getCache<Supplier>(cacheKey);
  if (cached) return cached;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!supplier) return null;
  const result = serializeSupplier(supplier as Record<string, unknown>);
  await setCache(cacheKey, result);
  return result;
}

export async function createSupplier(data: CreateSupplierInput): Promise<Supplier> {
  const supplier = await prisma.supplier.create({ data });
  await invalidatePattern(`${CACHE_PREFIX}:*`);
  return serializeSupplier(supplier as Record<string, unknown>);
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<Supplier> {
  const supplier = await prisma.supplier.update({ where: { id }, data });
  await invalidatePattern(`${CACHE_PREFIX}:*`);
  return serializeSupplier(supplier as Record<string, unknown>);
}

export async function deleteSupplier(id: string): Promise<void> {
  await prisma.supplier.delete({ where: { id } });
  await invalidatePattern(`${CACHE_PREFIX}:*`);
}
