"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  createPostActionWithFormData,
  type CreatePostState,
} from "@/lib/actions/posts";

interface User {
  id: string;
  username: string;
  displayName: string;
  profileImage: string;
}

interface PostFormWithActionProps {
  user: User;
  replyToId?: string;
  replyToUserId?: string;
  onCancel?: () => void;
  placeholder?: string;
  onSuccess?: (post: any) => void;
}

function SubmitButton({
  content,
  imageUrl,
  isOverLimit,
  replyToId,
}: {
  content: string;
  imageUrl: string;
  isOverLimit: boolean;
  replyToId?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={(!content.trim() && !imageUrl) || isOverLimit || pending}
      className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "投稿中..." : replyToId ? "返信" : "投稿"}
    </button>
  );
}

const initialState: CreatePostState = {
  success: false,
  error: undefined,
  post: undefined,
  message: undefined,
};

export default function PostFormWithAction({
  user,
  replyToId,
  replyToUserId,
  onCancel,
  placeholder = "いまどうしてる？",
  onSuccess,
}: PostFormWithActionProps) {
  const [state, formAction] = useFormState(
    createPostActionWithFormData,
    initialState
  );
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 投稿成功時の処理
  useEffect(() => {
    if (state.success && state.post) {
      // フォームをリセット
      setContent("");
      setImageUrl("");
      setImagePreview(null);
      formRef.current?.reset();

      // 成功コールバック
      if (onSuccess) {
        onSuccess(state.post);
      }

      // キャンセルコールバック（返信フォームの場合）
      if (onCancel) {
        onCancel();
      }
    }
  }, [state.success, state.post, onSuccess, onCancel]);

  // エラー表示
  useEffect(() => {
    if (state.error) {
      alert(state.error);
    }
  }, [state.error]);

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

  const remainingChars = 280 - content.length;
  const isOverLimit = content.length > 280;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-b border-gray-200 dark:border-gray-800 p-4"
    >
      {/* Hidden fields */}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      {replyToId && <input type="hidden" name="replyToId" value={replyToId} />}

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
            name="content"
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
              <SubmitButton
                content={content}
                imageUrl={imageUrl}
                isOverLimit={isOverLimit}
                replyToId={replyToId}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

