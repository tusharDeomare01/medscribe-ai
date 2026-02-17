import mongoose, { Schema, Document } from "mongoose";

export interface IExtractedEntity {
  text: string;
  type: string;
  category: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
}

export interface IClinicalNote extends Document {
  patientId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  noteType: string;
  rawText: string;
  entities: {
    medications: IExtractedEntity[];
    diagnoses: IExtractedEntity[];
    procedures: IExtractedEntity[];
    symptoms: IExtractedEntity[];
    labResults: IExtractedEntity[];
  };
  soapNote?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  icdCodes?: { code: string; description: string; confidence: number }[];
  status: "draft" | "signed" | "amended";
  createdAt: Date;
  updatedAt: Date;
}

const ExtractedEntitySchema = new Schema<IExtractedEntity>(
  {
    text: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    startOffset: { type: Number },
    endOffset: { type: Number },
  },
  { _id: false }
);

const ClinicalNoteSchema = new Schema<IClinicalNote>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    noteType: {
      type: String,
      enum: ["progress_note", "admission", "discharge_summary", "consultation", "procedure_note"],
      default: "progress_note",
    },
    rawText: { type: String, required: true },
    entities: {
      medications: [ExtractedEntitySchema],
      diagnoses: [ExtractedEntitySchema],
      procedures: [ExtractedEntitySchema],
      symptoms: [ExtractedEntitySchema],
      labResults: [ExtractedEntitySchema],
    },
    soapNote: {
      subjective: { type: String },
      objective: { type: String },
      assessment: { type: String },
      plan: { type: String },
    },
    icdCodes: [
      {
        code: { type: String },
        description: { type: String },
        confidence: { type: Number },
      },
    ],
    status: { type: String, enum: ["draft", "signed", "amended"], default: "draft" },
  },
  { timestamps: true }
);

ClinicalNoteSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.models.ClinicalNote || mongoose.model<IClinicalNote>("ClinicalNote", ClinicalNoteSchema);
