import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInventoryTrend } from "@/services/inventory.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30;

    const trend = await getInventoryTrend(Math.min(days, 90));
    return NextResponse.json({ data: trend });
  } catch (error) {
    console.error("[GET /api/inventory/trend]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
