import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";

// Shared in-memory store with login route (persists per serverless cold start)
const globalWithUsers = global as typeof globalThis & {
  __registeredUsers?: Map<string, { name: string; email: string; password: string; role: string; specialization?: string }>;
};
if (!globalWithUsers.__registeredUsers) {
  globalWithUsers.__registeredUsers = new Map();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, specialization } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // ── Try MongoDB first ──
    const db = await connectDB();

    if (db) {
      const existing = await User.findOne({ email: emailLower });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email: emailLower,
        password: hashedPassword,
        role: role || "doctor",
        specialization,
      });

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

    // Check if email already registered in memory
    if (globalWithUsers.__registeredUsers!.has(emailLower)) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Block registering with the demo email
    if (emailLower === "doctor@medscribe.ai") {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role || "doctor";

    // Store in memory
    globalWithUsers.__registeredUsers!.set(emailLower, {
      name,
      email: emailLower,
      password: hashedPassword,
      role: userRole,
      specialization,
    });

    const userData = {
      id: `user-${emailLower.replace(/[^a-z0-9]/g, "-")}`,
      name,
      email: emailLower,
      role: userRole as "doctor" | "patient" | "admin",
      specialization,
    };

    const token = signToken(userData);

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
