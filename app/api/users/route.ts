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

    if (userId) {
      const targetUser = dataStore.getUser(userId);
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user: targetUser });
    }

    // 現在のユーザー情報を取得（ClerkのユーザーIDで直接取得）
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

    return NextResponse.json({ user: dummyUser });
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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, displayName, bio, profileImage, headerImage } = body;

    // ClerkのユーザーIDで直接取得
    let dummyUser = dataStore.getUser(user.id);
    if (!dummyUser) {
      // ユーザーが存在しない場合は作成
      dummyUser = dataStore.createUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        username: username || user.username || user.id.substring(0, 8),
        displayName: displayName || user.username || "User",
        bio: bio || "",
        profileImage:
          profileImage ||
          user.imageUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.id,
        headerImage:
          headerImage || "https://picsum.photos/800/200?random=" + user.id,
      });
    } else {
      // 既存ユーザーを更新
      dummyUser = dataStore.updateUser(dummyUser.id, {
        username: username !== undefined ? username : dummyUser.username,
        displayName:
          displayName !== undefined ? displayName : dummyUser.displayName,
        bio: bio !== undefined ? bio : dummyUser.bio,
        profileImage:
          profileImage !== undefined ? profileImage : dummyUser.profileImage,
        headerImage:
          headerImage !== undefined ? headerImage : dummyUser.headerImage,
      });
    }

    return NextResponse.json({ user: dummyUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
