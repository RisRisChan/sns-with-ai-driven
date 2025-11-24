"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  headerImage: string;
  followers: string[];
  following: string[];
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

export default function UserProfilePage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    userId?: string;
  } | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 現在のユーザー情報を取得
      const currentUserRes = await fetch("/api/users");
      const currentUserData = await currentUserRes.json();
      if (currentUserData.user) {
        setCurrentUser(currentUserData.user);
        setIsFollowing(currentUserData.user.following.includes(userId));
      }

      // プロフィールユーザー情報を取得
      const profileRes = await fetch(`/api/users?userId=${userId}`);
      const profileData = await profileRes.json();
      if (profileData.user) {
        setProfileUser(profileData.user);
      } else {
        router.push("/");
        return;
      }

      // ユーザーの投稿を取得
      const postsRes = await fetch(`/api/posts?userId=${userId}&type=user`);
      const postsData = await postsRes.json();
      if (postsData.posts) {
        setPosts(postsData.posts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch("/api/follow", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        loadData(); // データを再読み込み
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
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
          // 自分の投稿の場合はタイムラインに追加
          if (data.post.userId === userId) {
            setPosts((prev) => [data.post, ...prev]);
          }
          setReplyingTo(null);
          loadData(); // データを再読み込み
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = (postId: string) => {
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

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser || currentUser.id !== userId) return;

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setProfileUser(data.user);
          setCurrentUser(data.user);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">ログインが必要です</div>
        </main>
      </div>
    );
  }

  if (loading || !profileUser || !currentUser) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser.id === userId;

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <main className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold">{profileUser.displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {posts.length}件の投稿
              </p>
            </div>
          </div>
        </div>

        {/* ヘッダー画像 */}
        <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
          {profileUser.headerImage && (
            <Image
              src={profileUser.headerImage}
              alt="Header"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* プロフィール情報 */}
        <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="relative">
              <Image
                src={profileUser.profileImage}
                alt={profileUser.displayName}
                width={120}
                height={120}
                className="rounded-full border-4 border-white dark:border-black"
              />
            </div>
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {isEditing ? "キャンセル" : "プロフィール編集"}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? "border border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                }`}
              >
                {isFollowing ? "フォロー解除" : "フォロー"}
              </button>
            )}
          </div>

          {isEditing ? (
            <ProfileEditForm
              user={profileUser}
              onSave={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold mt-4">
                {profileUser.displayName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                @{profileUser.username}
              </p>
              {profileUser.bio && (
                <p className="mt-4 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {profileUser.bio}
                </p>
              )}
              <div className="flex gap-4 mt-4 text-sm">
                <Link
                  href={`/users/${userId}/following`}
                  className="hover:underline cursor-pointer"
                >
                  <span className="font-semibold">
                    {profileUser.following.length}
                  </span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    フォロー中
                  </span>
                </Link>
                <Link
                  href={`/users/${userId}/followers`}
                  className="hover:underline cursor-pointer"
                >
                  <span className="font-semibold">
                    {profileUser.followers.length}
                  </span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    フォロワー
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 投稿フォーム（自分のプロフィールの場合のみ） */}
        {isOwnProfile && (
          <>
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
          </>
        )}

        {/* 投稿一覧 */}
        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>まだ投稿がありません</p>
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
            <h3 className="font-bold text-lg mb-4">プロフィール情報</h3>
            {profileUser && (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">フォロー中:</span>{" "}
                  {profileUser.following.length}
                </p>
                <p>
                  <span className="font-semibold">フォロワー:</span>{" "}
                  {profileUser.followers.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ProfileEditForm({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [headerImage, setHeaderImage] = useState(user.headerImage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username,
      displayName,
      bio,
      profileImage,
      headerImage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">ユーザー名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">自己紹介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">
          プロフィール画像URL
        </label>
        <input
          type="text"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">
          ヘッダー画像URL
        </label>
        <input
          type="text"
          value={headerImage}
          onChange={(e) => setHeaderImage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
