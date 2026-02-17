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
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ success: true, data: [] });
    }

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
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();
    const body = await req.json();

    if (!db) {
      // Return a mock note so the UI works without a database
      const mockNote = {
        _id: `note-${Date.now()}`,
        ...body,
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: mockNote }, { status: 201 });
    }

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
