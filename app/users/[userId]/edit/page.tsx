"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { getUserById, updateUser, type User } from "@/lib/dal";
import { uploadImage } from "@/lib/actions/upload";

export default function EditProfilePage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    if (clerkUser && clerkUser.id !== userId) {
      router.replace(`/users/${userId}`);
      return;
    }
    loadData();
  }, [isSignedIn, userId, clerkUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      if (userData) {
        setProfileUser(userData);
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: Partial<User>) => {
    try {
      const updatedUser = await updateUser(updates);
      if (updatedUser) {
        setProfileUser(updatedUser);
        router.push(`/users/${userId}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("プロフィールの更新に失敗しました");
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

  if (loading || !profileUser) {
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
              <h2 className="text-xl font-bold">プロフィールを編集</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{profileUser.username}
              </p>
            </div>
          </div>
        </div>

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

        <div className="px-4 pb-8">
          <ProfileEditForm
            user={profileUser}
            onSave={handleSave}
            onCancel={() => router.push(`/users/${userId}`)}
          />
        </div>
      </main>
    </div>
  );
}

function ProfileEditForm({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (updates: Partial<User>) => Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(
    null
  );

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Supabaseにアップロード
    setIsUploadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData);

      if (result.success && result.url) {
        setProfileImage(result.url);
        alert("プロフィール画像をアップロードしました");
      } else {
        alert(result.error || "アップロードに失敗しました");
        setProfileImagePreview(null);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("アップロードに失敗しました");
      setProfileImagePreview(null);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleHeaderImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeaderImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Supabaseにアップロード
    setIsUploadingHeader(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData);

      if (result.success && result.url) {
        setHeaderImage(result.url);
        alert("カバー画像をアップロードしました");
      } else {
        alert(result.error || "アップロードに失敗しました");
        setHeaderImagePreview(null);
      }
    } catch (error) {
      console.error("Error uploading header image:", error);
      alert("アップロードに失敗しました");
      setHeaderImagePreview(null);
    } finally {
      setIsUploadingHeader(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        username,
        displayName,
        bio,
        profileImage,
        headerImage,
        location,
        website,
        birthdate,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-6">
      {/* カバー画像（ヘッダー画像）*/}
      <div>
        <label className="block text-sm font-semibold mb-3">
          カバー画像（ヘッダー画像）
        </label>
        <div className="space-y-3">
          {/* プレビュー */}
          <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            {(headerImagePreview || headerImage) && (
              <Image
                src={headerImagePreview || headerImage || ""}
                alt="Header preview"
                fill
                className="object-cover"
              />
            )}
            {!headerImagePreview && !headerImage && (
              <div className="flex items-center justify-center h-full text-gray-500">
                カバー画像
              </div>
            )}
          </div>
          {/* ファイル選択ボタン */}
          <div className="flex gap-2">
            <label
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isUploadingHeader
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              } text-white`}
            >
              {isUploadingHeader ? "アップロード中..." : "画像を選択"}
              <input
                type="file"
                accept="image/*"
                onChange={handleHeaderImageChange}
                disabled={isUploadingHeader}
                className="hidden"
              />
            </label>
          </div>
          {/* URL直接入力 */}
          <input
            type="text"
            value={headerImage}
            onChange={(e) => setHeaderImage(e.target.value)}
            placeholder="または画像URLを直接入力"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* プロフィール画像 */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          プロフィール画像
        </label>
        <div className="space-y-3">
          {/* プレビュー */}
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative mx-auto">
            {(profileImagePreview || profileImage) && (
              <Image
                src={profileImagePreview || profileImage || ""}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            )}
            {!profileImagePreview && !profileImage && (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                画像
              </div>
            )}
          </div>
          {/* ファイル選択ボタン */}
          <div className="flex gap-2 justify-center">
            <label
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isUploadingProfile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              } text-white`}
            >
              {isUploadingProfile ? "アップロード中..." : "画像を選択"}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                disabled={isUploadingProfile}
                className="hidden"
              />
            </label>
          </div>
          {/* URL直接入力 */}
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="または画像URLを直接入力"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
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
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "保存中..." : "保存"}
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
