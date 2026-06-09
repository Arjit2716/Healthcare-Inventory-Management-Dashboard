# 🏥 Healthcare Inventory Management Dashboard

A **production-grade** Healthcare Inventory Management System built with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Redis, and NextAuth.js.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Login / Register with email & password
- JWT-based sessions via NextAuth.js v5
- Role-Based Access Control: **Admin** and **Staff**
- Protected routes via Edge Middleware

### 📊 Dashboard
- Total Products, Low Stock Count, Expiring Products, Total Suppliers
- Total Inventory Value
- Recent Activity Feed (last 10 movements)

### 💊 Product Management
- Add / Edit / Delete products
- Search and filter by category, stock status, supplier
- SKU tracking, expiry date, min stock level
- Stock status badges (OK / Low / Critical / Out)

### 🏢 Supplier Management
- Full CRUD for suppliers
- Link products to suppliers
- Admin-only create/edit/delete

### 📦 Inventory Tracking
- Stock In / Stock Out movements
- Atomic quantity updates (no race conditions)
- Full movement history with filters

### 🚨 Alerts System
- Low Stock Alerts (auto-generated)
- Expiry Alerts (auto-generated)
- Severity levels: LOW / MEDIUM / HIGH / CRITICAL
- Mark individual or all alerts as read

### 📈 Analytics
- Inventory trend line chart (30/90 day)
- Category distribution pie chart
- Top products by movement bar chart

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (ioredis) |
| Auth | NextAuth.js v5 (Beta) |
| Charts | Recharts |
| Validation | Zod + React Hook Form |
| Containers | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Arjit2716/Healthcare-Inventory-Management-Dashboard.git
cd Healthcare-Inventory-Management-Dashboard/healthcare-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start PostgreSQL & Redis
```bash
# From the root directory
docker-compose up -d postgres redis
```

### 4. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 5. Set up the database
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 👤 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@healthcare.com | Admin@123 |
| **Staff** | staff@healthcare.com | Staff@123 |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/             # Login, Register (public)
│   ├── (dashboard)/        # All protected pages
│   └── api/                # REST API route handlers
├── components/             # React components (by feature)
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Sidebar, Navbar
│   ├── dashboard/          # Stat cards, activity feed
│   ├── products/           # Product table, forms, modals
│   ├── suppliers/          # Supplier management UI
│   ├── inventory/          # Stock movement forms
│   ├── alerts/             # Alert list, bell icon
│   └── analytics/          # Recharts wrappers
├── services/               # Server-side business logic
├── lib/                    # Singleton clients (Prisma, Redis, Auth)
├── types/                  # Global TypeScript types
├── validations/            # Zod schemas (shared client+server)
├── constants/              # Routes, config, categories
├── hooks/                  # Custom React data hooks
└── middleware.ts            # Edge route protection
```

---

## 🐳 Docker

Run the full stack (App + PostgreSQL + Redis):
```bash
docker-compose up -d
```

Stop everything:
```bash
docker-compose down
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/healthcare_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `NEXTAUTH_SECRET` | Secret for JWT signing (32+ chars) | `your-secret-here` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |

---

## 🏗️ Architecture

```
Browser
  └── middleware.ts (Edge JWT check)
        └── app/(dashboard)/page.tsx (RSC)
              └── services/*.service.ts
                    ├── Redis (cache-first)
                    └── Prisma → PostgreSQL
```

---

## 📄 License

MIT © [Arjit2716](https://github.com/Arjit2716)
