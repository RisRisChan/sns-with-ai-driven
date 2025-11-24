import PostForm from "@/components/PostForm";
import type { Post, User } from "@/types/post";

interface ReplyFormProps {
  post: Post;
  currentUser: User;
  onPostSubmit: (
    content: string,
    imageUrl?: string,
    replyToId?: string
  ) => Promise<void>;
  onCancel?: () => void;
}

export default function ReplyForm({
  post,
  currentUser,
  onPostSubmit,
  onCancel,
}: ReplyFormProps) {
  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-800 pt-3">
      <PostForm
        user={currentUser}
        onSubmit={async (content, imageUrl, replyToId) => {
          await onPostSubmit(content, imageUrl, post.id);
          if (onCancel) {
            onCancel();
          }
        }}
        replyToId={post.id}
        replyToUserId={post.user?.id}
        onCancel={onCancel}
        placeholder={`@${post.user?.username} に返信`}
      />
    </div>
  );
}

