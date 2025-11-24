"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import {
  getCurrentUser,
  getHomeTimeline,
  createPost,
  type Post,
  type User,
} from "@/lib/dal";

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
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getHomeTimeline();
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (
    content: string,
    imageUrl?: string,
    replyToId?: string
  ) => {
    try {
      const newPost = await createPost({ content, imageUrl, replyToId });
      if (newPost) {
        if (replyToId) {
          // 返信の場合は、親投稿のreplies配列に追加
          setPosts((prev) =>
            prev.map((post) => {
              if (post.id === replyToId) {
                return {
                  ...post,
                  replies: [
                    ...(post.replies || []),
                    {
                      id: newPost.id,
                      userId: newPost.userId,
                      content: newPost.content,
                      createdAt: newPost.createdAt,
                      likes: newPost.likes,
                      user: newPost.user,
                    },
                  ],
                };
              }
              return post;
            })
          );
        } else {
          // 通常の投稿の場合は、タイムラインの先頭に追加
          setPosts((prev) => [newPost, ...prev]);
        }
        setReplyingTo(null);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <main className="w-full md:flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
          <h2 className="text-xl font-bold">ホーム</h2>
        </div>

        <PostForm
          user={currentUser}
          onSubmit={handlePostSubmit}
          placeholder="いまどうしてる？"
        />

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
                replyingToPostId={replyingTo?.postId || null}
                onShowReplyForm={(postId, replyToUserId) => {
                  setReplyingTo({ postId, userId: replyToUserId });
                }}
                onCancelReply={() => setReplyingTo(null)}
                currentUser={currentUser}
                onPostSubmit={handlePostSubmit}
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
