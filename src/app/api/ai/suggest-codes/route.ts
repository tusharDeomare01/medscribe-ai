import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, MEDICAL_CODING_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { noteText } = await req.json();
    if (!noteText) {
      return NextResponse.json({ error: "Clinical note text is required" }, { status: 400 });
    }

    const ai = getGemini();

    const prompt = `${MEDICAL_CODING_PROMPT}
${noteText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const result = JSON.parse(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Medical coding error:", error);
    return NextResponse.json({ error: "Failed to suggest codes" }, { status: 500 });
  }
}
