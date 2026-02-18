import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, PRE_SCREENING_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { screeningData } = await req.json();
    if (!screeningData) {
      return NextResponse.json({ error: "Screening data is required" }, { status: 400 });
    }

    const ai = getGemini();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${PRE_SCREENING_PROMPT}${JSON.stringify(screeningData)}`,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const analysis = JSON.parse(text);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: unknown) {
    console.error("Pre-screening analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze screening" }, { status: 500 });
  }
}
