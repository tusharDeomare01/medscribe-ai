import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import Patient from "@/models/Patient";
import ClinicalNote from "@/models/ClinicalNote";
import Report from "@/models/Report";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();

    if (!db) {
      // Return zero counts when no database is available
      return NextResponse.json({
        success: true,
        data: {
          patients: 0,
          notes: 0,
          reports: 0,
          analyses: 0,
        },
      });
    }

    const [patients, notes, reports] = await Promise.all([
      Patient.countDocuments({ createdBy: user.id }),
      ClinicalNote.countDocuments({ authorId: user.id }),
      Report.countDocuments({ uploadedBy: user.id }),
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
    return NextResponse.json({
      success: true,
      data: {
        patients: 0,
        notes: 0,
        reports: 0,
        analyses: 0,
      },
    });
  }
}
