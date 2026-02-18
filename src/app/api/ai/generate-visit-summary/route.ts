import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGemini, VISIT_SUMMARY_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clinicalNoteText, soapNote } = await req.json();
    if (!clinicalNoteText) {
      return NextResponse.json({ error: "Clinical note text is required" }, { status: 400 });
    }

    const ai = getGemini();

    const noteContent = soapNote
      ? `Raw note: ${clinicalNoteText}\n\nSOAP Note: ${JSON.stringify(soapNote)}`
      : clinicalNoteText;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${VISIT_SUMMARY_PROMPT}${noteContent}`,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const summary = JSON.parse(text);

    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    console.error("Visit summary generation error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
