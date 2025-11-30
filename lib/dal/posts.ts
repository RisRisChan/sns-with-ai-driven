// 投稿関連のデータアクセスレイヤー
import type { User } from "./users";

export interface Reply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: string[];
  user?: User;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  likes: string[];
  replies: Reply[];
  user?: User;
  replyToId?: string;
  replyToUserId?: string;
}

export interface CreatePostParams {
  content: string;
  imageUrl?: string;
  replyToId?: string;
}

/**
 * ホームタイムラインの投稿を取得
 */
export async function getHomeTimeline(): Promise<Post[]> {
  try {
    const response = await fetch("/api/posts?type=home");
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching home timeline:", error);
    return [];
  }
}

/**
 * 指定されたユーザーの投稿を取得
 */
export async function getPostsByUserId(userId: string): Promise<Post[]> {
  try {
    const response = await fetch(`/api/posts?userId=${userId}&type=user`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

/**
 * 投稿を作成
 */
export async function createPost(
  params: CreatePostParams
): Promise<Post | null> {
  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create post");
    }

    const data = await response.json();
    return data.post || null;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * 投稿を削除
 */
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/posts?postId=${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete post");
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
