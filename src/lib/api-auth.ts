import { NextRequest } from "next/server";
import { verifyToken, UserPayload } from "./auth";

export function getAuthUser(req: NextRequest): UserPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
}
