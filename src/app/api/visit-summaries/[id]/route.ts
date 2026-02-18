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
    const visit = await prisma.visitSummary.findUnique({
      where: { id },
      include: {
        patient: true,
        clinicalNote: true,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    console.error("Visit fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch visit" }, { status: 500 });
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

    if (updates.followUpDate) {
      updates.followUpDate = new Date(updates.followUpDate);
    }

    const visit = await prisma.visitSummary.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: visit });
  } catch (error: unknown) {
    console.error("Visit update error:", error);
    return NextResponse.json({ error: "Failed to update visit" }, { status: 500 });
  }
}
