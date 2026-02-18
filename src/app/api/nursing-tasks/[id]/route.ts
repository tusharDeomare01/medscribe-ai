import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const task = await prisma.nursingTask.update({
      where: { id, createdBy: user.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.completedAt && { completedAt: new Date(body.completedAt) }),
        ...(body.priority && { priority: body.priority }),
        ...(body.description && { description: body.description }),
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
