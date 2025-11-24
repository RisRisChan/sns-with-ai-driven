"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale/ja";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  displayName: string;
  profileImage: string;
}

interface Reply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: string[];
  user?: User;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: string[];
  replies: Reply[];
  user?: User;
  replyToId?: string;
  replyToUserId?: string;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReply: (postId: string, replyToUserId?: string) => void;
  isReply?: boolean;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  isReply = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    currentUserId ? post.likes.includes(currentUserId) : false
  );
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await fetch(`/api/likes?postId=${post.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });
      }
      onLike(post.id);
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
      const response = await fetch(`/api/posts?postId=${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(post.id);
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

  if (!post.user) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-800 ${
        isReply ? "pl-12" : ""
      }`}
    >
      <div className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <Link href={`/users/${post.user.id}`}>
          <Image
            src={post.user.profileImage}
            alt={post.user.displayName}
            width={48}
            height={48}
            className="rounded-full cursor-pointer"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/users/${post.user.id}`}>
              <span className="font-semibold hover:underline cursor-pointer">
                {post.user.displayName}
              </span>
            </Link>
            <Link href={`/users/${post.user.id}`}>
              <span className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer">
                @{post.user.username}
              </span>
            </Link>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400">{timeAgo}</span>
            {post.replyToId && (
              <>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-blue-500 dark:text-blue-400">返信</span>
              </>
            )}
          </div>
          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words mb-3">
            {post.content}
          </p>
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onReply(post.id, post.user?.id)}
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
              {post.replies.length > 0 && <span>{post.replies.length}</span>}
            </button>
            <button
              onClick={handleLike}
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "削除中..." : "削除"}
              </button>
            )}
          </div>
          {/* 返信の表示 */}
          {post.replies && post.replies.length > 0 && !isReply && (
            <div className="mt-3 space-y-2">
              {post.replies.map((reply) => (
                <PostCard
                  key={reply.id}
                  post={reply as Post}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReply={onReply}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
