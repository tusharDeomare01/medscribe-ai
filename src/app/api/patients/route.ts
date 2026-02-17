import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import Patient from "@/models/Patient";

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

    const patients = await Patient.find({ createdBy: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: patients });
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
      // Return a mock patient object so the UI works without a database
      const mockPatient = {
        _id: `patient-${Date.now()}`,
        ...body,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: mockPatient }, { status: 201 });
    }

    const patient = await Patient.create({
      ...body,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
