import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const notes = await prisma.clinicalNote.findMany({
      where: {
        authorId: user.id,
        ...(patientId ? { patientId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: { name: true, age: true, gender: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: notes });
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

    const note = await prisma.clinicalNote.create({
      data: {
        noteType: body.noteType || "progress_note",
        rawText: body.rawText,
        authorName: user.name,
        entities: body.entities || null,
        soapNote: body.soapNote || null,
        icdCodes: body.icdCodes || null,
        status: body.status || "draft",
        patientId: body.patientId || null,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
