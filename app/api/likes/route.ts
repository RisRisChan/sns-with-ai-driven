import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { dataStore } from "@/lib/dummy-data";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
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

    dataStore.likePost(postId, dummyUser.id);
    const post = dataStore.getPost(postId);

    return NextResponse.json({
      success: true,
      likes: post?.likes || [],
      likesCount: post?.likes.length || 0,
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

    dataStore.unlikePost(postId, dummyUser.id);
    const post = dataStore.getPost(postId);

    return NextResponse.json({
      success: true,
      likes: post?.likes || [],
      likesCount: post?.likes.length || 0,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
