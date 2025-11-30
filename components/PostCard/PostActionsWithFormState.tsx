"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { Post } from "@/types/post";

interface PostActionsWithFormStateProps {
  post: Post;
  currentUserId?: string;
  isLiked: boolean;
  likesCount: number;
  repliesCount: number;
  onReply: () => void;
  likeAction: (payload: FormData) => void;
  deleteAction: (payload: FormData) => void;
  postId: string;
}

function LikeButton({
  isLiked,
  likesCount,
}: {
  isLiked: boolean;
  likesCount: number;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <svg
        className="w-5 h-5"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {likesCount > 0 && <span>{likesCount}</span>}
      {pending && <span className="text-xs">...</span>}
    </>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return <>{pending ? "削除中..." : "削除"}</>;
}

export default function PostActionsWithFormState({
  post,
  currentUserId,
  isLiked,
  likesCount,
  repliesCount,
  onReply,
  likeAction,
  deleteAction,
  postId,
}: PostActionsWithFormStateProps) {
  const router = useRouter();

  const handleReply = () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }
    onReply();
  };

  const handleLikeClick = () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }
  };

  const handleDeleteClick = () => {
    if (!confirm("この投稿を削除しますか？")) {
      return;
    }
  };

  return (
    <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
      <button
        onClick={handleReply}
        className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {repliesCount > 0 && <span>{repliesCount}</span>}
      </button>

      <form action={likeAction} onClick={handleLikeClick}>
        <input type="hidden" name="postId" value={postId} />
        <button
          type="submit"
          disabled={!currentUserId}
          className={`flex items-center gap-2 transition-colors ${
            isLiked
              ? "text-red-500 dark:text-red-400"
              : "hover:text-red-500 dark:hover:text-red-400"
          }`}
        >
          <LikeButton isLiked={isLiked} likesCount={likesCount} />
        </button>
      </form>

      {currentUserId === post.userId && (
        <form action={deleteAction} onClick={handleDeleteClick} className="ml-auto">
          <input type="hidden" name="postId" value={postId} />
          <button
            type="submit"
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <DeleteButton />
          </button>
        </form>
      )}
    </div>
  );
}

