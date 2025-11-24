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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    if (dummyUser.id === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    dataStore.followUser(dummyUser.id, userId);
    const targetUser = dataStore.getUser(userId);

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
    const user = await currentUser();
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

    dataStore.unfollowUser(dummyUser.id, userId);
    const targetUser = dataStore.getUser(userId);

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
