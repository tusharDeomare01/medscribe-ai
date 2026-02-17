import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";

// Demo account — auto-seeded on first login attempt
const DEMO_EMAIL = "doctor@medscribe.ai";
const DEMO_PASSWORD = "password123";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Auto-seed demo user if it doesn't exist yet
    if (email.toLowerCase() === DEMO_EMAIL) {
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

    const user = await User.findOne({ email: email.toLowerCase() });
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
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
