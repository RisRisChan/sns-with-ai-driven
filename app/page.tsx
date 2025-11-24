"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";

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

export default function Home() {
  const { user, isSignedIn } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    userId?: string;
  } | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      loadUser();
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const loadUser = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/posts?type=home");
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (content: string, replyToId?: string) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, replyToId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.post) {
          setPosts((prev) => [data.post, ...prev]);
          setReplyingTo(null);
        }
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const handleLike = (postId: string) => {
    // 投稿のいいね状態を更新
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = currentUser
            ? post.likes.includes(currentUser.id)
            : false;
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((id) => id !== currentUser?.id)
              : [...post.likes, currentUser?.id || ""],
          };
        }
        return post;
      })
    );
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleReply = (postId: string, replyToUserId?: string) => {
    setReplyingTo({ postId, userId: replyToUserId });
  };

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">SNSにようこそ</h1>
            <p className="text-gray-600 dark:text-gray-400">
              ログインしてタイムラインを表示してください
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <main className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
          <h2 className="text-xl font-bold">ホーム</h2>
        </div>

        {replyingTo ? (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <PostForm
              user={currentUser}
              onSubmit={handlePostSubmit}
              replyToId={replyingTo.postId}
              replyToUserId={replyingTo.userId}
              onCancel={() => setReplyingTo(null)}
              placeholder="返信を投稿..."
            />
          </div>
        ) : (
          <PostForm
            user={currentUser}
            onSubmit={handlePostSubmit}
            placeholder="いまどうしてる？"
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              読み込み中...
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>まだ投稿がありません</p>
              <p className="text-sm mt-2">最初の投稿をしてみましょう！</p>
            </div>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onLike={handleLike}
                onDelete={handleDelete}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </main>
      <aside className="w-80 p-4 hidden lg:block">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg mb-4">トレンド</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              トレンド機能は今後実装予定です
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
