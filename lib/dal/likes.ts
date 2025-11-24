// いいね関連のデータアクセスレイヤー

export interface LikeResponse {
  success: boolean;
  likes: string[];
  likesCount: number;
}

/**
 * 投稿にいいねを追加
 */
export async function likePost(postId: string): Promise<LikeResponse> {
  try {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to like post");
    }

    const data = await response.json();
    return {
      success: data.success || false,
      likes: data.likes || [],
      likesCount: data.likesCount || 0,
    };
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

/**
 * 投稿のいいねを削除
 */
export async function unlikePost(postId: string): Promise<LikeResponse> {
  try {
    const response = await fetch(`/api/likes?postId=${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to unlike post");
    }

    const data = await response.json();
    return {
      success: data.success || false,
      likes: data.likes || [],
      likesCount: data.likesCount || 0,
    };
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
}

