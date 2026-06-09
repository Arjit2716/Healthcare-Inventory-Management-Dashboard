import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAlertRead } from "@/services/alert.service";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const alert = await markAlertRead(id);
    return NextResponse.json({ data: alert });
  } catch (error) {
    console.error("[PATCH /api/alerts/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
