import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getInventoryLogs,
  createStockMovement,
} from "@/services/inventory.service";
import { stockMovementSchema } from "@/validations/inventory.schema";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const type      = (searchParams.get("type") as "STOCK_IN" | "STOCK_OUT") || undefined;
    const page      = Number(searchParams.get("page"))  || 1;
    const limit     = Number(searchParams.get("limit")) || 20;
    const search    = searchParams.get("search")   || undefined;
    const dateFrom  = searchParams.get("dateFrom") || undefined;
    const dateTo    = searchParams.get("dateTo")   || undefined;

    const result = await getInventoryLogs(productId, type, page, limit, search, dateFrom, dateTo);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/inventory]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const parsed = stockMovementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const log = await createStockMovement(parsed.data, session.user.id);
    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("[POST /api/inventory]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
