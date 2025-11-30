import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    // GET リクエストは認証不要でタイムラインを閲覧可能
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "home";

    let posts;
    if (type === "home") {
      // ホームタイムライン（すべてのユーザーの投稿を時系列順に表示、返信以外）
      posts = await prisma.post.findMany({
        where: {
          replyToId: null,
        },
        include: {
          user: true,
          likes: {
            include: {
              user: true,
            },
          },
          replies: {
            include: {
              user: true,
              likes: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (userId) {
      // 特定ユーザーのタイムライン
      posts = await prisma.post.findMany({
        where: {
          userId,
          replyToId: null,
        },
        include: {
          user: true,
          likes: {
            include: {
              user: true,
            },
          },
          replies: {
            include: {
              user: true,
              likes: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      posts = await prisma.post.findMany({
        where: {
          replyToId: null,
        },
        include: {
          user: true,
          likes: {
            include: {
              user: true,
            },
          },
          replies: {
            include: {
              user: true,
              likes: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // レスポンス形式を既存の形式に合わせる
    const postsWithUsers = posts.map((post: (typeof posts)[0]) => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl || undefined,
      createdAt: post.createdAt,
      likes: post.likes.map((like: { userId: string }) => like.userId),
      replies: (post.replies || []).map((reply: (typeof post.replies)[0]) => ({
        id: reply.id,
        userId: reply.userId,
        content: reply.content,
        createdAt: reply.createdAt,
        likes: reply.likes.map((like: { userId: string }) => like.userId),
        user: reply.user,
      })),
      user: post.user,
      replyToId: post.replyToId || undefined,
      replyToUserId: post.replyToUserId || undefined,
    }));

    return NextResponse.json({ posts: postsWithUsers });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, replyToId, imageUrl } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: "Content must be 280 characters or less" },
        { status: 400 }
      );
    }

    let replyToUserId: string | undefined;
    if (replyToId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: replyToId },
        select: { userId: true },
      });
      replyToUserId = parentPost?.userId;
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        replyToId: replyToId || null,
        replyToUserId: replyToUserId || null,
      },
      include: {
        user: true,
        likes: true,
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        userId: post.userId,
        content: post.content,
        imageUrl: post.imageUrl || undefined,
        createdAt: post.createdAt,
        likes: [],
        replies: [],
        user: post.user,
        replyToId: post.replyToId || undefined,
        replyToUserId: post.replyToUserId || undefined,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
