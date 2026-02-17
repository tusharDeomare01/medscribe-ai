import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medscribe-ai-secret-key-2026";

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient" | "admin";
  specialization?: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}
