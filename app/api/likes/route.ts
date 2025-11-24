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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // 既にいいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({
        success: true,
        likes: [],
        likesCount: 0,
      });
    }

    await prisma.like.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    const likes = await prisma.like.findMany({
      where: { postId },
      select: { userId: true },
    });

    return NextResponse.json({
      success: true,
      likes: likes.map((like: { userId: string }) => like.userId),
      likesCount: likes.length,
    });
  } catch (error) {
    console.error("Error liking post:", error);
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
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await prisma.like.deleteMany({
      where: {
        userId: user.id,
        postId,
      },
    });

    const likes = await prisma.like.findMany({
      where: { postId },
      select: { userId: true },
    });

    return NextResponse.json({
      success: true,
      likes: likes.map((like: { userId: string }) => like.userId),
      likesCount: likes.length,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
