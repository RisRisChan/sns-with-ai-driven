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
  onSubmit: (
    content: string,
    imageUrl?: string,
    replyToId?: string
  ) => Promise<void>;
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
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルをDataURLに変換してプレビュー
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 実際のアップロードは行わず、DataURLをそのまま使用
      // 本番環境では、実際のファイルアップロードAPIを呼び出す必要があります
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        setImageUrl(reader2.result as string);
      };
      reader2.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageUrl) || content.length > 280 || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, imageUrl || undefined, replyToId);
      setContent("");
      setImageUrl("");
      setImagePreview(null);
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
        <span
          style={{ height: 48, width: 48, display: "inline-block" }}
          className="rounded-full overflow-hidden flex-shrink-0"
        >
          <Image
            src={user.profileImage}
            alt={user.displayName}
            width={48}
            height={48}
            className="object-cover w-full h-full"
            style={{ height: "100%", width: "100%" }}
          />
        </span>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-none border-none outline-none bg-transparent text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            rows={replyToId ? 3 : 4}
            maxLength={280}
          />
          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={imagePreview}
                alt="Preview"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              {!imagePreview && (
                <label className="cursor-pointer text-blue-500 hover:text-blue-600 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
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
                disabled={
                  (!content.trim() && !imageUrl) || isOverLimit || isSubmitting
                }
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
