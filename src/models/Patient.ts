import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  allergies: string[];
  currentMedications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    bloodGroup: { type: String },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String },
    allergies: [{ type: String }],
    currentMedications: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
