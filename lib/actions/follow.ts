"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/db-helpers";
import { revalidatePath } from "next/cache";

export interface FollowActionState {
  success: boolean;
  isFollowing?: boolean;
  error?: string;
}

/**
 * フォローをトグルするServer Action
 */
export async function toggleFollowAction(
  targetUserId: string,
  currentIsFollowing: boolean
): Promise<FollowActionState> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    // バリデーション
    if (!targetUserId) {
      return { success: false, error: "ユーザーIDが必要です" };
    }

    if (user.id === targetUserId) {
      return { success: false, error: "自分自身をフォローできません" };
    }

    // ターゲットユーザーが存在するか確認
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, error: "ユーザーが見つかりません" };
    }

    if (currentIsFollowing) {
      // フォロー解除
      await prisma.follow.deleteMany({
        where: {
          followerId: user.id,
          followingId: targetUserId,
        },
      });
    } else {
      // フォロー
      // 既にフォローしているか確認（二重フォロー防止）
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId,
          },
        },
      });

      if (!existingFollow) {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: targetUserId,
          },
        });
      }
    }

    // キャッシュを無効化
    revalidatePath(`/users/${targetUserId}`);
    revalidatePath(`/users/${user.id}`);
    revalidatePath(`/users/${targetUserId}/followers`);
    revalidatePath(`/users/${targetUserId}/following`);

    return { success: true, isFollowing: !currentIsFollowing };
  } catch (error) {
    console.error("Error toggling follow:", error);
    return {
      success: false,
      error: "フォロー/フォロー解除中にエラーが発生しました",
    };
  }
}

/**
 * フォロー数を取得するServer Action
 */
export async function getFollowCounts(userId: string): Promise<{
  followers: number;
  following: number;
}> {
  try {
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: userId },
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  } catch (error) {
    console.error("Error getting follow counts:", error);
    return { followers: 0, following: 0 };
  }
}

/**
 * フォロワーリストを取得するServer Action
 */
export async function getFollowersList(userId: string) {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return followers.map((follow) => follow.follower);
  } catch (error) {
    console.error("Error getting followers list:", error);
    return [];
  }
}

/**
 * フォロー中リストを取得するServer Action
 */
export async function getFollowingList(userId: string) {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return following.map((follow) => follow.following);
  } catch (error) {
    console.error("Error getting following list:", error);
    return [];
  }
}

/**
 * フォロー状態を確認するServer Action
 */
export async function checkIsFollowing(
  targetUserId: string
): Promise<boolean> {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      console.log('⚠️ checkIsFollowing: ユーザー認証なし');
      return false;
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    const isFollowing = !!follow;
    console.log('✅ checkIsFollowing:', {
      currentUserId: user.id,
      targetUserId,
      isFollowing,
      followRecord: follow ? 'exists' : 'not found'
    });

    return isFollowing;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

