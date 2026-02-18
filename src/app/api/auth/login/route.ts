import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

// Demo account — auto-seeded on first login attempt
const DEMO_EMAIL = "doctor@medscribe.ai";
const DEMO_PASSWORD = "password123";

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

    // Auto-seed demo user if it doesn't exist yet
    if (emailLower === DEMO_EMAIL) {
      const exists = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
      if (!exists) {
        const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
        await prisma.user.create({
          data: {
            name: "Dr. Demo",
            email: DEMO_EMAIL,
            password: hashed,
            role: "doctor",
            specialization: "General Medicine",
          },
        });
      }
    }

    const user = await prisma.user.findUnique({ where: { email: emailLower } });
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
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "doctor" | "patient" | "admin",
      specialization: user.specialization ?? undefined,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
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
