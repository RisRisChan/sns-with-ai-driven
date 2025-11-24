import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          following: {
            select: { followingId: true },
          },
          followers: {
            select: { followerId: true },
          },
        },
      });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // レスポンス形式を既存の形式に合わせる
      const userWithFollows = {
        ...targetUser,
        following: targetUser.following.map((f) => f.followingId),
        followers: targetUser.followers.map((f) => f.followerId),
      };

      return NextResponse.json({ user: userWithFollows });
    }

    // 現在のユーザー情報を取得
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // フォロー情報を含めて取得
    const userWithFollows = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        following: {
          select: { followingId: true },
        },
        followers: {
          select: { followerId: true },
        },
      },
    });

    if (!userWithFollows) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // レスポンス形式を既存の形式に合わせる
    const responseUser = {
      ...userWithFollows,
      following: userWithFollows.following.map((f) => f.followingId),
      followers: userWithFollows.followers.map((f) => f.followerId),
    };

    return NextResponse.json({ user: responseUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getOrCreateUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      displayName,
      bio,
      profileImage,
      headerImage,
      location,
      website,
      birthdate,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(username !== undefined && { username }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
        ...(headerImage !== undefined && { headerImage }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(birthdate !== undefined && { birthdate }),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
