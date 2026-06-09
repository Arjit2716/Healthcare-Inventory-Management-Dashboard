import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCategoryDistribution, getTopProducts } from "@/services/analytics.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "categories";

    if (type === "top-products") {
      const data = await getTopProducts();
      return NextResponse.json({ data });
    }

    const data = await getCategoryDistribution();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/analytics/categories]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
