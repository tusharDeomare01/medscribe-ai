import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const carePlan = await prisma.carePlan.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!carePlan) {
      return NextResponse.json({ error: "Care plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: carePlan });
  } catch (error: unknown) {
    console.error("Care plan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch care plan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await req.json();

    const carePlan = await prisma.carePlan.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: carePlan });
  } catch (error: unknown) {
    console.error("Care plan update error:", error);
    return NextResponse.json({ error: "Failed to update care plan" }, { status: 500 });
  }
}
