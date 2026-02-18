import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, NURSING_ASSISTANT_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { voiceText, patientName } = await req.json();
    if (!voiceText) {
      return NextResponse.json({ error: "Voice text is required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${NURSING_ASSISTANT_PROMPT}
Patient: ${patientName || "Unknown"}
${voiceText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Nursing assistant error:", error);
    return NextResponse.json({ error: "Failed to process nursing input" }, { status: 500 });
  }
}
