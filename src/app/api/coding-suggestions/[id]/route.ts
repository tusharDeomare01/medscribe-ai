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

    const coding = await prisma.medicalCoding.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.reviewedBy && { reviewedBy: body.reviewedBy }),
        ...(body.auditFlags && { auditFlags: body.auditFlags }),
        ...(body.denialRisk !== undefined && { denialRisk: body.denialRisk }),
        ...(body.denialReasons && { denialReasons: body.denialReasons }),
      },
    });

    return NextResponse.json({ success: true, data: coding });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
