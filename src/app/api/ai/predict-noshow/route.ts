import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, NOSHOW_PREDICTION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientName, age, gender, appointmentHistory } = await req.json();

    const ai = getGemini();

    const prompt = `${NOSHOW_PREDICTION_PROMPT}
Patient Name: ${patientName || "N/A"}
Age: ${age || "N/A"}
Gender: ${gender || "N/A"}
Appointment History: ${JSON.stringify(appointmentHistory || [])}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("No-show prediction error:", error);
    return NextResponse.json({ error: "Failed to predict no-show risk" }, { status: 500 });
  }
}
