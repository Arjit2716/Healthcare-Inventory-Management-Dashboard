import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductsClient } from "@/components/products/products-client";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <ProductsClient />;
}
