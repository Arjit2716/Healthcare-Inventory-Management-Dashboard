import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlerts, getUnreadCount, markAllRead } from "@/services/alert.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    if (searchParams.get("count") === "true") {
      const count = await getUnreadCount();
      return NextResponse.json({ data: count });
    }

    const type = (searchParams.get("type") as "LOW_STOCK" | "EXPIRY") || undefined;
    const isRead = searchParams.get("isRead") === "true" ? true
      : searchParams.get("isRead") === "false" ? false
      : undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await getAlerts(type, isRead, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await markAllRead();
    return NextResponse.json({ message: "All alerts marked as read" });
  } catch (error) {
    console.error("[PATCH /api/alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
