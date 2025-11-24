"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import {
  getCurrentUser,
  getUserById,
  getUsersByIds,
  type User,
} from "@/lib/dal";

interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  followers: string[];
  following: string[];
}

export default function FollowersPage() {
  const { isSignedIn } = useUser();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

      const currentUserData = await getCurrentUser();
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }

      const profileUserData = await getUserById(userId);
      if (profileUserData) {
        setProfileUser(profileUserData);

        // フォロワー一覧を取得
        const followerIds = profileUserData.followers || [];
        const followersList = await getUsersByIds(followerIds);
        setFollowers(followersList);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
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
                フォロワー
              </p>
            </div>
          </div>
        </div>

        {followers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>フォロワーがいません</p>
            </div>
          </div>
        ) : (
          <div>
            {followers.map((follower) => (
              <Link
                key={follower.id}
                href={`/users/${follower.id}`}
                className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <Image
                  src={follower.profileImage}
                  alt={follower.displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold">{follower.displayName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{follower.username}
                  </div>
                  {follower.bio && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {follower.bio}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
