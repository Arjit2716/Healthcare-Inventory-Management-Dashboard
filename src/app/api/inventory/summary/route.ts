import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInventorySummary } from "@/services/inventory.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const summary = await getInventorySummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("[GET /api/inventory/summary]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
