import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import ClinicalNote from "@/models/ClinicalNote";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const filter: Record<string, unknown> = { authorId: user.id };
    if (patientId) filter.patientId = patientId;

    const notes = await ClinicalNote.find(filter)
      .sort({ createdAt: -1 })
      .populate("patientId", "name age gender")
      .lean();

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
    await connectDB();
    const body = await req.json();

    const note = await ClinicalNote.create({
      ...body,
      authorId: user.id,
      authorName: user.name,
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
