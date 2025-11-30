"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/db-helpers";
import { revalidatePath } from "next/cache";
import type { Post, Reply } from "@/lib/dal/posts";

export interface CreatePostParams {
  content: string;
  imageUrl?: string;
  replyToId?: string;
}

export type { Post, Reply };

export interface CreatePostState {
  success: boolean;
  post?: Post;
  error?: string;
  message?: string;
}

/**
 * 投稿を作成するServer Action（useFormState用）
 */
export async function createPostActionWithFormData(
  prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const content = formData.get("content") as string;
    const imageUrl = formData.get("imageUrl") as string | null;
    const replyToId = formData.get("replyToId") as string | null;

    // バリデーション
    if (!content || content.trim().length === 0) {
      return { success: false, error: "投稿内容を入力してください" };
    }

    if (content.length > 280) {
      return {
        success: false,
        error: "投稿は280文字以内で入力してください",
      };
    }

    // 返信先の投稿が存在するか確認し、返信先ユーザーIDを取得
    let replyToUserId: string | undefined;
    if (replyToId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: replyToId },
        select: { userId: true },
      });

      if (!parentPost) {
        return { success: false, error: "返信先の投稿が見つかりません" };
      }

      replyToUserId = parentPost.userId;
    }

    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        replyToId: replyToId || null,
        replyToUserId: replyToUserId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true,
              },
            },
            likes: true,
          },
        },
      },
    });

    // キャッシュを無効化してページを再検証
    revalidatePath("/");
    if (replyToId) {
      revalidatePath(`/posts/${replyToId}`);
    }

    // レスポンス形式を整形
    const formattedPost: Post = {
      id: post.id,
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl || undefined,
      createdAt: post.createdAt,
      likes: post.likes.map((like) => like.userId),
      replies: [],
      user: post.user as any,
      replyToId: post.replyToId || undefined,
      replyToUserId: post.replyToUserId || undefined,
    };

    return { success: true, post: formattedPost, message: "投稿しました" };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: "投稿の作成中にエラーが発生しました",
    };
  }
}

/**
 * 投稿を作成するServer Action（従来版）
 */
export async function createPostAction(
  params: CreatePostParams
): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const { content, imageUrl, replyToId } = params;

    // バリデーション
    if (!content || content.trim().length === 0) {
      return { success: false, error: "投稿内容を入力してください" };
    }

    if (content.length > 280) {
      return {
        success: false,
        error: "投稿は280文字以内で入力してください",
      };
    }

    // 返信先の投稿が存在するか確認し、返信先ユーザーIDを取得
    let replyToUserId: string | undefined;
    if (replyToId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: replyToId },
        select: { userId: true },
      });

      if (!parentPost) {
        return { success: false, error: "返信先の投稿が見つかりません" };
      }

      replyToUserId = parentPost.userId;
    }

    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        replyToId: replyToId || null,
        replyToUserId: replyToUserId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileImage: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profileImage: true,
              },
            },
            likes: true,
          },
        },
      },
    });

    // キャッシュを無効化してページを再検証
    revalidatePath("/");
    if (replyToId) {
      revalidatePath(`/posts/${replyToId}`);
    }

    // レスポンス形式を整形
    const formattedPost: Post = {
      id: post.id,
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl || undefined,
      createdAt: post.createdAt,
      likes: post.likes.map((like) => like.userId),
      replies: [],
      user: post.user as any,
      replyToId: post.replyToId || undefined,
      replyToUserId: post.replyToUserId || undefined,
    };

    return { success: true, post: formattedPost };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: "投稿の作成中にエラーが発生しました",
    };
  }
}

export interface DeletePostState {
  success: boolean;
  error?: string;
  postId?: string;
}

/**
 * 投稿を削除するServer Action（useFormState用）
 */
export async function deletePostActionWithFormData(
  prevState: DeletePostState,
  formData: FormData
): Promise<DeletePostState> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const postId = formData.get("postId") as string;

    // バリデーション
    if (!postId) {
      return { success: false, error: "投稿IDが必要です" };
    }

    // 投稿が存在し、ユーザーが所有者であることを確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return { success: false, error: "投稿が見つかりません" };
    }

    if (post.userId !== user.id) {
      return { success: false, error: "この投稿を削除する権限がありません" };
    }

    // 投稿を削除
    await prisma.post.delete({
      where: { id: postId },
    });

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/users/${user.id}`);

    return { success: true, postId };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: "投稿の削除中にエラーが発生しました",
    };
  }
}

/**
 * 投稿を削除するServer Action（従来版）
 */
export async function deletePostAction(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    // バリデーション
    if (!postId) {
      return { success: false, error: "投稿IDが必要です" };
    }

    // 投稿が存在し、ユーザーが所有者であることを確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return { success: false, error: "投稿が見つかりません" };
    }

    if (post.userId !== user.id) {
      return { success: false, error: "この投稿を削除する権限がありません" };
    }

    // 投稿を削除
    await prisma.post.delete({
      where: { id: postId },
    });

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/users/${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: "投稿の削除中にエラーが発生しました",
    };
  }
}

export interface ToggleLikeState {
  success: boolean;
  isLiked?: boolean;
  error?: string;
}

/**
 * いいねをトグルするServer Action（useFormState用）
 */
export async function toggleLikeActionWithFormData(
  prevState: ToggleLikeState,
  formData: FormData
): Promise<ToggleLikeState> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const postId = formData.get("postId") as string;

    // バリデーション
    if (!postId) {
      return { success: false, error: "投稿IDが必要です" };
    }

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "投稿が見つかりません" };
    }

    // いいねが既に存在するか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // いいねを削除
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      });
      isLiked = true;
    }

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);

    return { success: true, isLiked };
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: "いいねの更新中にエラーが発生しました",
    };
  }
}

/**
 * いいねをトグルするServer Action（従来版）
 */
export async function toggleLikeAction(
  postId: string
): Promise<{ success: boolean; isLiked?: boolean; error?: string }> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    // バリデーション
    if (!postId) {
      return { success: false, error: "投稿IDが必要です" };
    }

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "投稿が見つかりません" };
    }

    // いいねが既に存在するか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // いいねを削除
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      });
      isLiked = true;
    }

    // キャッシュを無効化
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);

    return { success: true, isLiked };
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: "いいねの更新中にエラーが発生しました",
    };
  }
}

