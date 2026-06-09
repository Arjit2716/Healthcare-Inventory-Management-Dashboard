import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInventoryTrends } from "@/services/analytics.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30;

    const trends = await getInventoryTrends(days);
    return NextResponse.json({ data: trends });
  } catch (error) {
    console.error("[GET /api/analytics/trends]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
