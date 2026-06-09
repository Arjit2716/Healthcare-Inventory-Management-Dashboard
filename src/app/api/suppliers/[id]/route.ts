import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupplierById, updateSupplier, deleteSupplier } from "@/services/supplier.service";
import { updateSupplierSchema } from "@/validations/supplier.schema";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supplier = await getSupplierById(id);
    if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error("[GET /api/suppliers/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const supplier = await updateSupplier(id, parsed.data);
    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error("[PUT /api/suppliers/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await deleteSupplier(id);
    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json({ error: "Cannot delete supplier with existing products" }, { status: 409 });
    }
    console.error("[DELETE /api/suppliers/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
