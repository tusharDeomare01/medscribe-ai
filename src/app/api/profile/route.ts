import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { signToken } from "@/lib/auth";

/* ── GET /api/profile — fetch current user profile ── */
export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            patients: true,
            clinicalNotes: true,
            reports: true,
            carePlans: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/* ── PATCH /api/profile — update profile fields ── */
export async function PATCH(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, specialization, avatar, currentPassword, newPassword } = body;

    // Build update data
    const updateData: Record<string, string> = {};

    if (name && name.trim()) updateData.name = name.trim();
    if (email && email.trim()) {
      // Check uniqueness
      const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existing && existing.id !== authUser.id) {
        return NextResponse.json({ success: false, error: "Email already in use" }, { status: 409 });
      }
      updateData.email = email.trim();
    }
    if (specialization !== undefined) updateData.specialization = specialization.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    // Password change
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: authUser.id } });
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "New password must be at least 6 characters" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        avatar: true,
      },
    });

    // Issue a fresh JWT with updated user data
    const newToken = signToken({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "doctor" | "patient" | "admin",
      specialization: updated.specialization || undefined,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      token: newToken,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
