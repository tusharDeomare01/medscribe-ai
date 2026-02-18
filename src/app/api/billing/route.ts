import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await prisma.billingRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        patient: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: records });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
