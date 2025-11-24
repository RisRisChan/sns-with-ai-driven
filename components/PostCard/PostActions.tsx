import type { Post, User } from "@/types/post";

interface PostActionsProps {
  post: Post;
  currentUserId?: string;
  isLiked: boolean;
  likesCount: number;
  repliesCount: number;
  isDeleting: boolean;
  onLike: () => void;
  onDelete: () => void;
  onReply: () => void;
}

export default function PostActions({
  post,
  currentUserId,
  isLiked,
  likesCount,
  repliesCount,
  isDeleting,
  onLike,
  onDelete,
  onReply,
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
      <button
        onClick={onReply}
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
      <button
        onClick={onLike}
        className={`flex items-center gap-2 transition-colors ${
          isLiked
            ? "text-red-500 dark:text-red-400"
            : "hover:text-red-500 dark:hover:text-red-400"
        }`}
      >
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
      </button>
      {currentUserId === post.userId && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "削除"}
        </button>
      )}
    </div>
  );
}

