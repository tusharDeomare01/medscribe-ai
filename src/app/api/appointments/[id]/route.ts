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

    const appointment = await prisma.appointment.update({
      where: { id, doctorId: user.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }),
        ...(body.checkedInAt && { checkedInAt: new Date(body.checkedInAt) }),
        ...(body.checkedInVia && { checkedInVia: body.checkedInVia }),
        ...(body.noShowRisk !== undefined && { noShowRisk: body.noShowRisk }),
        ...(body.notes && { notes: body.notes }),
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
