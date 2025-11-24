"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import Image from "next/image";
import Link from "next/link";
import {
  getCurrentUser,
  getUserById,
  getPostsByUserId,
  createPost,
  toggleFollow,
  type Post,
  type User,
} from "@/lib/dal";

interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  headerImage: string;
  location?: string;
  website?: string;
  birthdate?: string;
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
  imageUrl?: string;
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
      const currentUserData = await getCurrentUser();
      if (currentUserData) {
        setCurrentUser(currentUserData);
        setIsFollowing(
          currentUserData.following?.includes(userId) || false
        );
      }

      // プロフィールユーザー情報を取得
      const profileUserData = await getUserById(userId);
      if (profileUserData) {
        setProfileUser(profileUserData);
      } else {
        router.push("/");
        return;
      }

      // ユーザーの投稿を取得
      const postsData = await getPostsByUserId(userId);
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      await toggleFollow(userId, isFollowing);
      setIsFollowing(!isFollowing);
      loadData(); // データを再読み込み
    } catch (error) {
      console.error("Error toggling follow:", error);
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
          // 通常の投稿の場合は、自分の投稿のみタイムラインに追加
          if (newPost.userId === userId) {
            setPosts((prev) => [newPost, ...prev]);
          }
        }
        setReplyingTo(null);
        // データを再読み込みして最新の状態を取得
        loadData();
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <main className="w-full md:flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
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
          <div className="relative flex justify-between items-start -mt-16 mb-4">
            <div className="inline-block">
              <Image
                src={profileUser.profileImage}
                alt={profileUser.displayName}
                width={120}
                height={120}
                className="rounded-full object-cover flex-shrink-0 border-4 border-white dark:border-black"
              />
            </div>
            {isOwnProfile ? (
              <Link
                href={`/users/${userId}/edit`}
                className="absolute -bottom-2 right-0 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-semibold bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Edit profile
              </Link>
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

          <h1 className="text-2xl font-bold mt-4">{profileUser.displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            @{profileUser.username}
          </p>
          {profileUser.bio && (
            <p className="mt-4 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {profileUser.bio}
            </p>
          )}
          <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
            {profileUser.location && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4s-3 1.567-3 3.5S10.343 11 12 11z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 22C12 22 5 14.5 5 8.5 5 4.91 8.134 2 12 2s7 2.91 7 6.5c0 6-7 13.5-7 13.5z"
                  />
                </svg>
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v14m7-7H5"
                  />
                </svg>
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {profileUser.website}
                </a>
              </div>
            )}
            {profileUser.birthdate && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  生年月日:{" "}
                  {new Date(profileUser.birthdate).toLocaleDateString("ja-JP")}
                </span>
              </div>
            )}
          </div>
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
        </div>

        {/* 投稿フォーム（自分のプロフィールの場合のみ） */}
        {isOwnProfile && !replyingTo && (
          <PostForm
            user={currentUser}
            onSubmit={handlePostSubmit}
            placeholder="いまどうしてる？"
          />
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
  const [location, setLocation] = useState(user.location || "");
  const [website, setWebsite] = useState(user.website || "");
  const [birthdate, setBirthdate] = useState(
    user.birthdate ? user.birthdate.slice(0, 10) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username,
      displayName,
      bio,
      profileImage,
      headerImage,
      location,
      website,
      birthdate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">名前</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">場所</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Web</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">生年月日</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
        />
      </div>
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
