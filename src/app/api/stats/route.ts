import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [patients, notes, reports] = await Promise.all([
      prisma.patient.count({ where: { createdBy: user.id } }),
      prisma.clinicalNote.count({ where: { authorId: user.id } }),
      prisma.report.count({ where: { uploadedBy: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        patients,
        notes,
        reports,
        analyses: notes + reports,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
