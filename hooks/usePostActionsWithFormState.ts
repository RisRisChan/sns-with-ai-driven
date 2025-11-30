"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import {
  toggleLikeActionWithFormData,
  deletePostActionWithFormData,
  type ToggleLikeState,
  type DeletePostState,
} from "@/lib/actions/posts";

interface UsePostActionsWithFormStateProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

const initialLikeState: ToggleLikeState = {
  success: false,
  isLiked: undefined,
  error: undefined,
};

const initialDeleteState: DeletePostState = {
  success: false,
  error: undefined,
  postId: undefined,
};

export function usePostActionsWithFormState({
  postId,
  initialLiked,
  initialLikesCount,
  currentUserId,
  onLike,
  onDelete,
}: UsePostActionsWithFormStateProps) {
  const [likeState, likeAction] = useFormState(
    toggleLikeActionWithFormData,
    initialLikeState
  );
  const [deleteState, deleteAction] = useFormState(
    deletePostActionWithFormData,
    initialDeleteState
  );

  // いいねの状態を管理（楽観的更新のため）
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  // いいねのレスポンスを処理
  useEffect(() => {
    if (likeState.success && likeState.isLiked !== undefined) {
      setIsLiked(likeState.isLiked);
      setLikesCount((prev) => (likeState.isLiked ? prev + 1 : prev - 1));
      onLike(postId);
    }
    if (likeState.error) {
      console.error("Error toggling like:", likeState.error);
    }
  }, [likeState, postId, onLike]);

  // 削除のレスポンスを処理
  useEffect(() => {
    if (deleteState.success && deleteState.postId) {
      onDelete(deleteState.postId);
    }
    if (deleteState.error) {
      alert(deleteState.error);
    }
  }, [deleteState, onDelete]);

  const handleLike = () => {
    if (!currentUserId) return;

    // 楽観的更新
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
  };

  const handleDelete = () => {
    if (!confirm("この投稿を削除しますか？")) return;
  };

  return {
    isLiked,
    likesCount,
    isDeleting: deleteState.success === false && deleteState.error !== undefined,
    handleLike,
    handleDelete,
    likeAction,
    deleteAction,
    postId,
  };
}

