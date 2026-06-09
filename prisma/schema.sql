-- =============================================================
-- Healthcare Inventory Management Dashboard
-- PostgreSQL 16 — Raw SQL DDL Reference
-- Generated from Prisma Schema
-- =============================================================

-- ─────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE "MovementType" AS ENUM ('STOCK_IN', 'STOCK_OUT');
CREATE TYPE "AlertType" AS ENUM ('LOW_STOCK', 'EXPIRY');
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ─────────────────────────────────────────
-- users
-- ─────────────────────────────────────────

CREATE TABLE users (
    id               VARCHAR(30)  NOT NULL,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    "hashedPassword" VARCHAR(255) NOT NULL,
    role             "UserRole"   NOT NULL DEFAULT 'STAFF',
    "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ  NOT NULL,

    CONSTRAINT users_pkey        PRIMARY KEY (id),
    CONSTRAINT users_email_key   UNIQUE (email),
    CONSTRAINT users_name_check  CHECK (LENGTH(TRIM(name)) >= 2),
    CONSTRAINT users_email_check CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- ─────────────────────────────────────────
-- suppliers
-- ─────────────────────────────────────────

CREATE TABLE suppliers (
    id               VARCHAR(30)  NOT NULL,
    name             VARCHAR(200) NOT NULL,
    "contactPerson"  VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(20)  NOT NULL,
    address          TEXT         NOT NULL,
    "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ  NOT NULL,

    CONSTRAINT suppliers_pkey        PRIMARY KEY (id),
    CONSTRAINT suppliers_email_key   UNIQUE (email),
    CONSTRAINT suppliers_name_check  CHECK (LENGTH(TRIM(name)) >= 2),
    CONSTRAINT suppliers_phone_check CHECK (LENGTH(TRIM(phone)) >= 7)
);

-- Supplier search index (full-text)
CREATE INDEX suppliers_name_idx
    ON suppliers USING GIN (to_tsvector('english', name));

-- ─────────────────────────────────────────
-- products
-- ─────────────────────────────────────────

CREATE TABLE products (
    id               VARCHAR(30)    NOT NULL,
    name             VARCHAR(200)   NOT NULL,
    sku              VARCHAR(50)    NOT NULL,
    category         VARCHAR(100)   NOT NULL,
    description      TEXT,
    unit             VARCHAR(30)    NOT NULL DEFAULT 'units',
    quantity         INTEGER        NOT NULL DEFAULT 0,
    "minStockLevel"  INTEGER        NOT NULL DEFAULT 10,
    "expiryDate"     TIMESTAMPTZ,
    price            DECIMAL(10, 2) NOT NULL,
    "supplierId"     VARCHAR(30)    NOT NULL,
    "createdAt"      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ    NOT NULL,

    CONSTRAINT products_pkey             PRIMARY KEY (id),
    CONSTRAINT products_sku_key          UNIQUE (sku),

    CONSTRAINT products_supplier_fk      FOREIGN KEY ("supplierId")
        REFERENCES suppliers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT products_quantity_check   CHECK (quantity >= 0),
    CONSTRAINT products_minstock_check   CHECK ("minStockLevel" >= 1),
    CONSTRAINT products_price_check      CHECK (price >= 0)
);

-- B-Tree indexes for filtering and joining
CREATE INDEX products_category_idx   ON products (category);
CREATE INDEX products_supplier_idx   ON products ("supplierId");
CREATE INDEX products_sku_idx        ON products (sku);
CREATE INDEX products_updated_idx    ON products ("updatedAt" DESC);

-- Partial index: only non-null expiry dates (equipment has no expiry)
CREATE INDEX products_expiry_idx     ON products ("expiryDate")
    WHERE "expiryDate" IS NOT NULL;

-- Composite: low-stock scan
CREATE INDEX products_stock_idx      ON products (quantity, "minStockLevel");

-- GIN full-text search: name + SKU + category
CREATE INDEX products_search_idx     ON products
    USING GIN (to_tsvector('english', name || ' ' || sku || ' ' || category));

-- ─────────────────────────────────────────
-- inventory_logs  (Append-Only)
-- ─────────────────────────────────────────

CREATE TABLE inventory_logs (
    id          VARCHAR(30)    NOT NULL,
    "productId" VARCHAR(30)    NOT NULL,
    "userId"    VARCHAR(30)    NOT NULL,
    type        "MovementType" NOT NULL,
    quantity    INTEGER        NOT NULL,
    notes       TEXT,
    "createdAt" TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT inventory_logs_pkey       PRIMARY KEY (id),

    CONSTRAINT inventory_logs_product_fk FOREIGN KEY ("productId")
        REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT inventory_logs_user_fk    FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT inventory_logs_qty_check  CHECK (quantity > 0)
);

CREATE INDEX inventory_logs_product_idx      ON inventory_logs ("productId");
CREATE INDEX inventory_logs_user_idx         ON inventory_logs ("userId");
CREATE INDEX inventory_logs_created_idx      ON inventory_logs ("createdAt" DESC);
CREATE INDEX inventory_logs_type_idx         ON inventory_logs (type);

-- Composite: most common analytics query (product history over time)
CREATE INDEX inventory_logs_product_time_idx
    ON inventory_logs ("productId", "createdAt" DESC);

-- ─────────────────────────────────────────
-- alerts
-- ─────────────────────────────────────────

CREATE TABLE alerts (
    id          VARCHAR(30)     NOT NULL,
    "productId" VARCHAR(30)     NOT NULL,
    type        "AlertType"     NOT NULL,
    severity    "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    message     VARCHAR(500)    NOT NULL,
    "isRead"    BOOLEAN         NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ     NOT NULL,

    CONSTRAINT alerts_pkey          PRIMARY KEY (id),

    CONSTRAINT alerts_product_fk    FOREIGN KEY ("productId")
        REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT alerts_message_check CHECK (LENGTH(TRIM(message)) >= 5)
);

CREATE INDEX alerts_product_idx  ON alerts ("productId");
CREATE INDEX alerts_type_idx     ON alerts (type);

-- Partial index: only unread alerts (critical for notification bell performance)
-- With 10,000 total alerts and 50 unread, this index has 50 rows — 200x faster
CREATE INDEX alerts_unread_idx   ON alerts ("isRead")
    WHERE "isRead" = FALSE;

-- Composite: priority sort (unread first → severity → recency)
CREATE INDEX alerts_priority_idx ON alerts ("isRead", severity DESC, "createdAt" DESC);
