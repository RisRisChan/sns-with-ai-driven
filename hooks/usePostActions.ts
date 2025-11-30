import { useState } from "react";
import { toggleLikeAction, deletePostAction } from "@/lib/actions/posts";

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
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const result = await toggleLikeAction(postId);

      if (!result.success) {
        // エラー時は元に戻す
        setIsLiked(wasLiked);
        setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        console.error("Error toggling like:", result.error);
        return;
      }

      onLike(postId);
    } catch (error) {
      // エラー時は元に戻す
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;
    setIsDeleting(true);

    try {
      const result = await deletePostAction(postId);

      if (result.success) {
        onDelete(postId);
      } else {
        alert(result.error || "投稿の削除に失敗しました");
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
    isLiking,
    handleLike,
    handleDelete,
  };
}
