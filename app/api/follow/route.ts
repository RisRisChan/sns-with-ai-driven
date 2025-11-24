import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (user.id === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // 既にフォローしているか確認
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      return NextResponse.json({
        success: true,
        user: targetUser,
      });
    }

    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: userId,
      },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: user.id,
        followingId: userId,
      },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
