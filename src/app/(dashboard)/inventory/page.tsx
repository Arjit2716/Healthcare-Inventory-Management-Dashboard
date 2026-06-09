import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InventoryClient } from "@/components/inventory/inventory-client";

export const metadata: Metadata = { title: "Inventory Tracking" };

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <InventoryClient />;
}
