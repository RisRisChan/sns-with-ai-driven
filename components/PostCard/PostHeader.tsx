import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale/ja";
import type { Post, User } from "@/types/post";

interface PostHeaderProps {
  post: Post;
  user: User;
}

export default function PostHeader({ post, user }: PostHeaderProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div className="flex items-center gap-2 mb-1">
      <Link href={`/users/${user.id}`}>
        <span className="font-semibold hover:underline cursor-pointer">
          {user.displayName}
        </span>
      </Link>
      <Link href={`/users/${user.id}`}>
        <span className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer">
          @{user.username}
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
  );
}

