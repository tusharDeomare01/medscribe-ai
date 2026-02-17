import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  patientId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileType: string;
  fileData?: string; // base64
  extractedData: {
    labValues: {
      test: string;
      value: string;
      unit: string;
      referenceRange: string;
      flag: "normal" | "high" | "low" | "critical";
    }[];
    findings: string[];
    recommendations: string[];
  };
  explanation: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileData: { type: String },
    extractedData: {
      labValues: [
        {
          test: String,
          value: String,
          unit: String,
          referenceRange: String,
          flag: { type: String, enum: ["normal", "high", "low", "critical"] },
        },
      ],
      findings: [String],
      recommendations: [String],
    },
    explanation: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
