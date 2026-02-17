import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, NER_PROMPT, SOAP_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 });
    }

    const ai = getGemini();

    // Run NER and SOAP generation in parallel
    const [nerResponse, soapResponse] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: NER_PROMPT + text,
        config: {
          responseMimeType: "application/json",
        },
      }),
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: SOAP_PROMPT + text,
        config: {
          responseMimeType: "application/json",
        },
      }),
    ]);

    let entities = { medications: [], diagnoses: [], procedures: [], symptoms: [], labResults: [] };
    let soapNote = { subjective: "", objective: "", assessment: "", plan: "" };
    let icdCodes: { code: string; description: string; confidence: number }[] = [];

    try {
      const nerData = JSON.parse(nerResponse.text || "{}");
      if (nerData.entities) entities = nerData.entities;
    } catch {
      console.error("Failed to parse NER response");
    }

    try {
      const soapData = JSON.parse(soapResponse.text || "{}");
      if (soapData.soapNote) soapNote = soapData.soapNote;
      if (soapData.icdCodes) icdCodes = soapData.icdCodes;
    } catch {
      console.error("Failed to parse SOAP response");
    }

    return NextResponse.json({
      success: true,
      data: { entities, soapNote, icdCodes },
    });
  } catch (error: unknown) {
    console.error("AI process-note error:", error);
    const message = error instanceof Error ? error.message : "AI processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
