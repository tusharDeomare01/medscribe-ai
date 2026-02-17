import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!ai) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return ai;
}

export const MEDICAL_SYSTEM_PROMPT = `You are MedScribe AI, an advanced clinical documentation assistant. You help healthcare professionals by:
- Analyzing clinical notes and extracting medical entities
- Generating structured SOAP notes from unstructured text
- Suggesting relevant ICD-10 codes
- Answering medical questions with evidence-based information

IMPORTANT: Always include a disclaimer that your output is AI-generated and should be verified by a licensed healthcare professional. Never provide definitive diagnoses.`;

export const SOAP_PROMPT = `Given the following clinical note, generate a structured SOAP note.

Output ONLY valid JSON with this exact format:
{
  "soapNote": {
    "subjective": "Patient's reported symptoms, history, and complaints",
    "objective": "Clinical findings, vital signs, exam results, lab values",
    "assessment": "Clinical assessment with suspected diagnoses and ICD-10 codes",
    "plan": "Treatment plan, medications, follow-ups, referrals"
  },
  "icdCodes": [
    { "code": "ICD-10 code", "description": "Description", "confidence": 0.0-1.0 }
  ]
}

Clinical Note:
`;

export const NER_PROMPT = `Extract all medical entities from the following clinical text. Categorize each entity and include its exact position in the text.

Output ONLY valid JSON with this format:
{
  "entities": {
    "medications": [{ "text": "entity text", "type": "Medication", "category": "medications", "confidence": 0.95, "startOffset": 0, "endOffset": 10 }],
    "diagnoses": [{ "text": "entity text", "type": "Disease_disorder", "category": "diagnoses", "confidence": 0.92, "startOffset": 0, "endOffset": 10 }],
    "procedures": [{ "text": "entity text", "type": "Procedure", "category": "procedures", "confidence": 0.90, "startOffset": 0, "endOffset": 10 }],
    "symptoms": [{ "text": "entity text", "type": "Sign_symptom", "category": "symptoms", "confidence": 0.88, "startOffset": 0, "endOffset": 10 }],
    "labResults": [{ "text": "entity text", "type": "Lab_value", "category": "labResults", "confidence": 0.91, "startOffset": 0, "endOffset": 10 }]
  }
}

Important: startOffset and endOffset must be the exact character positions in the original text.

Clinical Text:
`;

export const REPORT_ANALYSIS_PROMPT = `You are analyzing a medical lab report. Extract all lab values and provide a patient-friendly explanation.

Output ONLY valid JSON with this format:
{
  "labValues": [
    {
      "test": "Test name",
      "value": "Measured value",
      "unit": "Unit of measurement",
      "referenceRange": "Normal range",
      "flag": "normal" | "high" | "low" | "critical"
    }
  ],
  "findings": ["Key finding 1", "Key finding 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "explanation": "A plain-English summary of all results, explaining what each abnormal value means in simple language that a patient can understand."
}

Report content:
`;
