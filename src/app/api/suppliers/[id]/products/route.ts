import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupplierProducts } from "@/services/supplier.service";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const products = await getSupplierProducts(id);
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("[GET /api/suppliers/[id]/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
