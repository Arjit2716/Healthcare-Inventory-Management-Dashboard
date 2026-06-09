import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuppliersClient } from "@/components/suppliers/suppliers-client";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <SuppliersClient />;
}
