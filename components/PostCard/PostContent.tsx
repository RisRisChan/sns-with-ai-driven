import Image from "next/image";
import type { Post } from "@/types/post";

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  return (
    <>
      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words mb-3">
        {post.content}
      </p>
      {post.imageUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image
            src={post.imageUrl}
            alt="Post image"
            width={800}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </>
  );
}

