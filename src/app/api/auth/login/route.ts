import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";

// Demo account — works with and without a database
const DEMO_EMAIL = "doctor@medscribe.ai";
const DEMO_PASSWORD = "password123";
const DEMO_USER = {
  id: "demo-doctor-001",
  name: "Dr. Demo",
  email: DEMO_EMAIL,
  role: "doctor" as const,
  specialization: "General Medicine",
};

// In-memory store for users registered in stateless mode (persists per serverless cold start)
const globalWithUsers = global as typeof globalThis & {
  __registeredUsers?: Map<string, { name: string; email: string; password: string; role: string; specialization?: string }>;
};
if (!globalWithUsers.__registeredUsers) {
  globalWithUsers.__registeredUsers = new Map();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // ── Try MongoDB first ──
    const db = await connectDB();

    if (db) {
      // Auto-seed demo user if it doesn't exist yet
      if (emailLower === DEMO_EMAIL) {
        const exists = await User.findOne({ email: DEMO_EMAIL });
        if (!exists) {
          const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
          await User.create({
            name: "Dr. Demo",
            email: DEMO_EMAIL,
            password: hashed,
            role: "doctor",
            specialization: "General Medicine",
          });
        }
      }

      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = signToken({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
        },
      });
    }

    // ── Stateless fallback (no database) ──

    // Demo account — always works
    if (emailLower === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = signToken(DEMO_USER);
      return NextResponse.json({ success: true, token, user: DEMO_USER });
    }

    // Check in-memory registered users
    const memUser = globalWithUsers.__registeredUsers!.get(emailLower);
    if (memUser) {
      const isMatch = await bcrypt.compare(password, memUser.password);
      if (isMatch) {
        const userData = {
          id: `user-${emailLower.replace(/[^a-z0-9]/g, "-")}`,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role as "doctor" | "patient" | "admin",
          specialization: memUser.specialization,
        };
        const token = signToken(userData);
        return NextResponse.json({ success: true, token, user: userData });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
