import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { dataStore } from "@/lib/dummy-data";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "home";

    let posts;
    if (type === "home") {
      // ホームタイムライン（フォロー中のユーザー + 自分の投稿）
      let dummyUser = dataStore.getUser(user.id);
      if (!dummyUser) {
        // ユーザーが存在しない場合は作成
        dummyUser = dataStore.createUser({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          username: user.username || user.id.substring(0, 8),
          displayName:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "User",
          bio: "",
          profileImage:
            user.imageUrl ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.id,
          headerImage: "https://picsum.photos/800/200?random=" + user.id,
        });
      }
      posts = dataStore.getHomeTimeline(dummyUser.id);
    } else if (userId) {
      // 特定ユーザーのタイムライン
      posts = dataStore.getPostsByUser(userId);
    } else {
      posts = dataStore.getAllPosts();
    }

    // 投稿にユーザー情報を追加
    const postsWithUsers = posts.map((post) => {
      const postUser = dataStore.getUser(post.userId);
      const replies = post.replies
        .map((replyId) => {
          const reply = dataStore.getPost(replyId);
          if (!reply) return null;
          const replyUser = dataStore.getUser(reply.userId);
          return {
            ...reply,
            user: replyUser,
          };
        })
        .filter(Boolean);

      return {
        ...post,
        user: postUser,
        replies,
      };
    });

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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, replyToId } = body;

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

    // ClerkのユーザーIDで直接取得
    let dummyUser = dataStore.getUser(user.id);
    if (!dummyUser) {
      // ユーザーが存在しない場合は作成
      dummyUser = dataStore.createUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        username: user.username || user.id.substring(0, 8),
        displayName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || "User",
        bio: "",
        profileImage:
          user.imageUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.id,
        headerImage: "https://picsum.photos/800/200?random=" + user.id,
      });
    }

    let replyToUserId;
    if (replyToId) {
      const parentPost = dataStore.getPost(replyToId);
      replyToUserId = parentPost?.userId;
    }

    const post = dataStore.createPost({
      userId: dummyUser.id,
      content: content.trim(),
      replyToId,
      replyToUserId,
    });

    const postUser = dataStore.getUser(post.userId);
    return NextResponse.json({
      post: {
        ...post,
        user: postUser,
        replies: [],
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
    const user = await currentUser();
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

    let dummyUser = dataStore.getUser(user.id);
    if (!dummyUser) {
      // ユーザーが存在しない場合は作成
      dummyUser = dataStore.createUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        username: user.username || user.id.substring(0, 8),
        displayName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || "User",
        bio: "",
        profileImage:
          user.imageUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.id,
        headerImage: "https://picsum.photos/800/200?random=" + user.id,
      });
    }

    const success = dataStore.deletePost(postId, dummyUser.id);
    if (!success) {
      return NextResponse.json(
        { error: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
