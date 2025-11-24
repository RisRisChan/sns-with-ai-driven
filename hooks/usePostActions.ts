import { useState } from "react";
import { likePost, unlikePost, deletePost } from "@/lib/dal";

interface UsePostActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function usePostActions({
  postId,
  initialLiked,
  initialLikesCount,
  currentUserId,
  onLike,
  onDelete,
}: UsePostActionsProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      onLike(postId);
    } catch (error) {
      // エラー時は元に戻す
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;
    setIsDeleting(true);

    try {
      const success = await deletePost(postId);
      if (success) {
        onDelete(postId);
      } else {
        alert("投稿の削除に失敗しました");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("投稿の削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return {
    isLiked,
    likesCount,
    isDeleting,
    handleLike,
    handleDelete,
  };
}

