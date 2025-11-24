// フォロー関連のデータアクセスレイヤー

import type { User } from "./users";

export interface FollowResponse {
  success: boolean;
  user: User | null;
}

/**
 * ユーザーをフォロー
 */
export async function followUser(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to follow user");
    }

    const data = await response.json();
    return {
      success: data.success || false,
      user: data.user || null,
    };
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
}

/**
 * ユーザーのフォローを解除
 */
export async function unfollowUser(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch(`/api/follow?userId=${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to unfollow user");
    }

    const data = await response.json();
    return {
      success: data.success || false,
      user: data.user || null,
    };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
}

/**
 * フォロー状態を切り替え
 */
export async function toggleFollow(
  userId: string,
  isFollowing: boolean
): Promise<FollowResponse> {
  if (isFollowing) {
    return unfollowUser(userId);
  } else {
    return followUser(userId);
  }
}

