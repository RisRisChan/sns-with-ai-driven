"use client";

import { useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  displayName: string;
  profileImage: string;
}

interface PostFormProps {
  user: User;
  onSubmit: (content: string, replyToId?: string) => Promise<void>;
  replyToId?: string;
  replyToUserId?: string;
  onCancel?: () => void;
  placeholder?: string;
}

export default function PostForm({
  user,
  onSubmit,
  replyToId,
  replyToUserId,
  onCancel,
  placeholder = "いまどうしてる？",
}: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 280 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, replyToId);
      setContent("");
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = content.length > 280;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="flex gap-3">
        <Image
          src={user.profileImage}
          alt={user.displayName}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-none border-none outline-none bg-transparent text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            rows={replyToId ? 3 : 4}
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              {replyToId && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  キャンセル
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  isOverLimit
                    ? "text-red-500"
                    : remainingChars < 20
                    ? "text-orange-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {remainingChars}
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isOverLimit || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "投稿中..." : replyToId ? "返信" : "投稿"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
