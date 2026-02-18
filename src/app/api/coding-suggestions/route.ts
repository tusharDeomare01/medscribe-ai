import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const codings = await prisma.medicalCoding.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        clinicalNote: { select: { rawText: true, authorName: true } },
      },
    });

    return NextResponse.json({ success: true, data: codings });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const coding = await prisma.medicalCoding.create({
      data: {
        clinicalNoteId: body.clinicalNoteId,
        icdCodes: body.icdCodes || [],
        cptCodes: body.cptCodes || [],
        hcpcsCodes: body.hcpcsCodes,
        modifiers: body.modifiers,
        totalEstimated: body.totalEstimated,
        status: body.status || "suggested",
      },
    });

    return NextResponse.json({ success: true, data: coding }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
