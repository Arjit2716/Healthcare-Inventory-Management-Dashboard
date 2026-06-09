# 🗄️ Database Schema — Healthcare Inventory Management Dashboard

> PostgreSQL 16 · Prisma ORM · 5 Models · 4 Enums · 19 Indexes

---

## Entity Relationship Overview

```
users (1) ────────────────────────── (N) inventory_logs
                                               │
suppliers (1) ──── (N) products (1) ──────────┘
                            │
                            └── (N) inventory_logs
                            └── (N) alerts
```

---

## Tables

| Table | Rows (seeded) | Purpose |
|---|---|---|
| `users` | 2 | System users (Admin + Staff) |
| `suppliers` | 4 | Medical product vendors |
| `products` | 12 | Inventory items with stock levels |
| `inventory_logs` | 10 | Stock movement audit trail |
| `alerts` | 7 | Auto-generated low-stock + expiry alerts |

---

## Enums

| Enum | Values |
|---|---|
| `UserRole` | `ADMIN`, `STAFF` |
| `MovementType` | `STOCK_IN`, `STOCK_OUT` |
| `AlertType` | `LOW_STOCK`, `EXPIRY` |
| `AlertSeverity` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |

---

## Relationships & Foreign Keys

| From | To | Column | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `products` | `suppliers` | `supplierId` | **RESTRICT** | CASCADE |
| `inventory_logs` | `products` | `productId` | **CASCADE** | CASCADE |
| `inventory_logs` | `users` | `userId` | **RESTRICT** | CASCADE |
| `alerts` | `products` | `productId` | **CASCADE** | CASCADE |

### Why different ON DELETE behaviors?
- **RESTRICT** on `suppliers → products`: Cannot delete a supplier that still has active products
- **RESTRICT** on `users → inventory_logs`: Cannot delete users who have movement records (audit accountability)
- **CASCADE** on `products → logs/alerts`: Deleting a product cleans up all its history and alerts automatically

---

## Index Strategy

| Table | Index | Type | Covers |
|---|---|---|---|
| `users` | `email` (UNIQUE) | B-Tree | Login lookup |
| `suppliers` | `email` (UNIQUE) | B-Tree | Duplicate check |
| `suppliers` | `name` | GIN Full-Text | Search box |
| `products` | `sku` (UNIQUE) | B-Tree | SKU lookup |
| `products` | `category` | B-Tree | Filter dropdown |
| `products` | `supplierId` | B-Tree | JOIN performance |
| `products` | `expiryDate` | **Partial** B-Tree | Expiry alert scan |
| `products` | `(quantity, minStockLevel)` | Composite | Low-stock scan |
| `products` | `name+sku+category` | GIN Full-Text | Global search |
| `inventory_logs` | `productId` | B-Tree | Product history |
| `inventory_logs` | `userId` | B-Tree | User activity |
| `inventory_logs` | `createdAt DESC` | B-Tree | Analytics trends |
| `inventory_logs` | `(productId, createdAt)` | **Composite** | Product time-series |
| `alerts` | `isRead = FALSE` | **Partial** B-Tree | Notification bell count |
| `alerts` | `(isRead, severity, createdAt)` | **Composite** | Priority sort |

---

## Key Design Decisions

### 1. CUID over UUID or Auto-Increment
CUIDs are time-ordered (better B-Tree performance), URL-safe, and don't expose sequential record counts.

### 2. `DECIMAL(10,2)` not `FLOAT` for prices
Exact arithmetic for inventory valuations — no floating-point rounding errors.

### 3. Append-Only `inventory_logs`
No `updatedAt` column — stock movements are an immutable audit trail. Corrections are new opposing movements.

### 4. Deterministic Alert IDs
```
low-stock-{productId}  →  prevents duplicate low-stock alerts per product
expiry-{productId}     →  prevents duplicate expiry alerts per product
```
Enables upsert-based alert refresh (severity can escalate without creating duplicates).

### 5. `TIMESTAMPTZ` not `TIMESTAMP`
Timezone-aware storage — critical for hospitals across time zones.

---

## Files

| File | Purpose |
|---|---|
| [`prisma/schema.prisma`](./prisma/schema.prisma) | Prisma schema (source of truth) |
| [`prisma/schema.sql`](./prisma/schema.sql) | Raw SQL DDL reference for DBAs |
| [`prisma/seed.ts`](./prisma/seed.ts) | Demo data seeder |

---

## Setup Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema without migrations (dev only)
npm run db:push

# Seed demo data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```
