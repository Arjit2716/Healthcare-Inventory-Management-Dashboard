import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSuppliers, getAllSuppliers, createSupplier } from "@/services/supplier.service";
import { createSupplierSchema } from "@/validations/supplier.schema";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const suppliers = await getAllSuppliers();
      return NextResponse.json({ data: suppliers });
    }

    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await getSuppliers(search, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/suppliers]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supplier = await createSupplier(parsed.data);
    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error("[POST /api/suppliers]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
