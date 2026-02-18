import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, VITALS_ANALYSIS_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vitals, patientInfo } = await req.json();
    if (!vitals) {
      return NextResponse.json({ error: "Vitals data is required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${VITALS_ANALYSIS_PROMPT}
Patient: ${JSON.stringify(patientInfo || {})}
Vitals History: ${JSON.stringify(vitals)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Vitals analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze vitals" }, { status: 500 });
  }
}
