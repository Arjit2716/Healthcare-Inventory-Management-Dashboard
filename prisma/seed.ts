import { PrismaClient, UserRole, MovementType, AlertType, AlertSeverity } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@healthcare.com" },
    update: {},
    create: {
      name: "Dr. Sarah Johnson",
      email: "admin@healthcare.com",
      hashedPassword: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const staffPassword = await bcrypt.hash("Staff@123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@healthcare.com" },
    update: {},
    create: {
      name: "Mike Thompson",
      email: "staff@healthcare.com",
      hashedPassword: staffPassword,
      role: UserRole.STAFF,
    },
  });

  console.log("✅ Users created");

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { email: "pharmaplus@supplier.com" },
      update: {},
      create: { name: "PharmaPlus Distributors", contactPerson: "Robert Chen", email: "pharmaplus@supplier.com", phone: "+1-555-0101", address: "123 Medical District, Boston, MA 02101" },
    }),
    prisma.supplier.upsert({
      where: { email: "medequip@supplier.com" },
      update: {},
      create: { name: "MedEquip Solutions", contactPerson: "Linda Parker", email: "medequip@supplier.com", phone: "+1-555-0102", address: "456 Healthcare Ave, Chicago, IL 60601" },
    }),
    prisma.supplier.upsert({
      where: { email: "globalhealth@supplier.com" },
      update: {},
      create: { name: "Global Health Supplies", contactPerson: "James Wilson", email: "globalhealth@supplier.com", phone: "+1-555-0103", address: "789 Pharma Blvd, New York, NY 10001" },
    }),
    prisma.supplier.upsert({
      where: { email: "biomedical@supplier.com" },
      update: {},
      create: { name: "BioMedical Corp", contactPerson: "Emily Davis", email: "biomedical@supplier.com", phone: "+1-555-0104", address: "321 Bio Park, San Francisco, CA 94102" },
    }),
  ]);
  console.log("✅ Suppliers created");

  const now = new Date();
  const d = (days: number) => new Date(now.getTime() + days * 86400000);

  const products = await Promise.all([
    prisma.product.upsert({ where: { sku: "MED-AMX-500" }, update: {}, create: { name: "Amoxicillin 500mg Capsules", sku: "MED-AMX-500", category: "Antibiotics", description: "Broad-spectrum antibiotic", unit: "capsules", quantity: 8, minStockLevel: 50, expiryDate: d(15), price: 12.50, supplierId: suppliers[0].id } }),
    prisma.product.upsert({ where: { sku: "MED-PCM-1G" }, update: {}, create: { name: "Paracetamol 1000mg Tablets", sku: "MED-PCM-1G", category: "Analgesics", description: "Pain relief and fever reducer", unit: "tablets", quantity: 250, minStockLevel: 100, expiryDate: d(365), price: 5.75, supplierId: suppliers[0].id } }),
    prisma.product.upsert({ where: { sku: "MED-IBU-400" }, update: {}, create: { name: "Ibuprofen 400mg Tablets", sku: "MED-IBU-400", category: "Analgesics", description: "Anti-inflammatory pain relief", unit: "tablets", quantity: 5, minStockLevel: 75, expiryDate: d(25), price: 8.20, supplierId: suppliers[0].id } }),
    prisma.product.upsert({ where: { sku: "MED-MET-500" }, update: {}, create: { name: "Metformin 500mg Tablets", sku: "MED-MET-500", category: "Diabetes", description: "Blood glucose management", unit: "tablets", quantity: 180, minStockLevel: 50, expiryDate: d(540), price: 15.00, supplierId: suppliers[2].id } }),
    prisma.product.upsert({ where: { sku: "MED-LIP-20" }, update: {}, create: { name: "Lisinopril 20mg Tablets", sku: "MED-LIP-20", category: "Cardiovascular", description: "ACE inhibitor for hypertension", unit: "tablets", quantity: 12, minStockLevel: 30, expiryDate: d(20), price: 22.40, supplierId: suppliers[2].id } }),
    prisma.product.upsert({ where: { sku: "SUP-SYR-5ML" }, update: {}, create: { name: "Disposable Syringes 5ml", sku: "SUP-SYR-5ML", category: "Medical Supplies", description: "Single-use sterile syringes", unit: "pieces", quantity: 500, minStockLevel: 200, expiryDate: d(1095), price: 0.85, supplierId: suppliers[1].id } }),
    prisma.product.upsert({ where: { sku: "SUP-GLV-MED" }, update: {}, create: { name: "Surgical Gloves Medium", sku: "SUP-GLV-MED", category: "PPE", description: "Latex-free sterile surgical gloves", unit: "pairs", quantity: 45, minStockLevel: 100, expiryDate: d(730), price: 3.20, supplierId: suppliers[1].id } }),
    prisma.product.upsert({ where: { sku: "SUP-MSK-N95" }, update: {}, create: { name: "N95 Respiratory Masks", sku: "SUP-MSK-N95", category: "PPE", description: "NIOSH-approved N95 respirator masks", unit: "pieces", quantity: 200, minStockLevel: 100, expiryDate: d(1825), price: 2.50, supplierId: suppliers[1].id } }),
    prisma.product.upsert({ where: { sku: "EQP-BPM-DIG" }, update: {}, create: { name: "Digital Blood Pressure Monitor", sku: "EQP-BPM-DIG", category: "Equipment", description: "Automatic upper arm BP monitor", unit: "units", quantity: 15, minStockLevel: 5, price: 89.99, supplierId: suppliers[3].id } }),
    prisma.product.upsert({ where: { sku: "EQP-OXI-PUL" }, update: {}, create: { name: "Pulse Oximeter", sku: "EQP-OXI-PUL", category: "Equipment", description: "Fingertip SpO2 monitor", unit: "units", quantity: 3, minStockLevel: 8, price: 45.00, supplierId: suppliers[3].id } }),
    prisma.product.upsert({ where: { sku: "VAC-FLU-INF" }, update: {}, create: { name: "Influenza Vaccine Vials", sku: "VAC-FLU-INF", category: "Vaccines", description: "Seasonal flu vaccine multi-dose", unit: "vials", quantity: 6, minStockLevel: 20, expiryDate: d(10), price: 35.00, supplierId: suppliers[0].id } }),
    prisma.product.upsert({ where: { sku: "MED-INS-NPH" }, update: {}, create: { name: "Insulin NPH 10ml Vials", sku: "MED-INS-NPH", category: "Diabetes", description: "Intermediate-acting insulin", unit: "vials", quantity: 30, minStockLevel: 15, expiryDate: d(180), price: 48.00, supplierId: suppliers[2].id } }),
  ]);
  console.log("✅ Products created");

  await Promise.all([
    prisma.inventoryLog.create({ data: { productId: products[0].id, userId: admin.id, type: MovementType.STOCK_IN, quantity: 200, notes: "Initial stock from PharmaPlus" } }),
    prisma.inventoryLog.create({ data: { productId: products[0].id, userId: staff.id, type: MovementType.STOCK_OUT, quantity: 192, notes: "Dispensed to ward A" } }),
    prisma.inventoryLog.create({ data: { productId: products[1].id, userId: admin.id, type: MovementType.STOCK_IN, quantity: 500, notes: "Monthly restocking" } }),
    prisma.inventoryLog.create({ data: { productId: products[1].id, userId: staff.id, type: MovementType.STOCK_OUT, quantity: 250, notes: "Dispensed to pharmacy" } }),
    prisma.inventoryLog.create({ data: { productId: products[5].id, userId: admin.id, type: MovementType.STOCK_IN, quantity: 1000, notes: "Bulk order from MedEquip" } }),
    prisma.inventoryLog.create({ data: { productId: products[5].id, userId: staff.id, type: MovementType.STOCK_OUT, quantity: 500, notes: "Distributed to wards B and C" } }),
    prisma.inventoryLog.create({ data: { productId: products[6].id, userId: admin.id, type: MovementType.STOCK_IN, quantity: 200, notes: "Emergency restock PPE" } }),
    prisma.inventoryLog.create({ data: { productId: products[6].id, userId: staff.id, type: MovementType.STOCK_OUT, quantity: 155, notes: "Distributed to surgical team" } }),
    prisma.inventoryLog.create({ data: { productId: products[3].id, userId: staff.id, type: MovementType.STOCK_IN, quantity: 300, notes: "Restocked from Global Health" } }),
    prisma.inventoryLog.create({ data: { productId: products[3].id, userId: staff.id, type: MovementType.STOCK_OUT, quantity: 120, notes: "Dispensed to diabetic clinic" } }),
  ]);
  console.log("✅ Inventory logs created");

  await Promise.all([
    prisma.alert.create({ data: { productId: products[0].id, type: AlertType.LOW_STOCK, severity: AlertSeverity.CRITICAL, message: "Amoxicillin 500mg stock critically low (8 units remaining, min: 50)" } }),
    prisma.alert.create({ data: { productId: products[2].id, type: AlertType.LOW_STOCK, severity: AlertSeverity.CRITICAL, message: "Ibuprofen 400mg stock critically low (5 units remaining, min: 75)" } }),
    prisma.alert.create({ data: { productId: products[6].id, type: AlertType.LOW_STOCK, severity: AlertSeverity.HIGH, message: "Surgical Gloves stock below minimum threshold (45 pairs, min: 100)" } }),
    prisma.alert.create({ data: { productId: products[9].id, type: AlertType.LOW_STOCK, severity: AlertSeverity.HIGH, message: "Pulse Oximeter stock below minimum threshold (3 units, min: 8)" } }),
    prisma.alert.create({ data: { productId: products[10].id, type: AlertType.EXPIRY, severity: AlertSeverity.CRITICAL, message: "Influenza Vaccine expires in 10 days — immediate action required" } }),
    prisma.alert.create({ data: { productId: products[0].id, type: AlertType.EXPIRY, severity: AlertSeverity.HIGH, message: "Amoxicillin 500mg expires in 15 days" } }),
    prisma.alert.create({ data: { productId: products[2].id, type: AlertType.EXPIRY, severity: AlertSeverity.MEDIUM, message: "Ibuprofen 400mg expires in 25 days" } }),
  ]);
  console.log("✅ Alerts created");

  console.log("\n🎉 Seed completed!\n");
  console.log("📧 Demo Credentials:");
  console.log("   Admin: admin@healthcare.com / Admin@123");
  console.log("   Staff: staff@healthcare.com / Staff@123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
