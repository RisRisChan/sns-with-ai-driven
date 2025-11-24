// ユーザー関連のデータアクセスレイヤー

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  headerImage?: string;
  location?: string;
  website?: string;
  birthdate?: string;
  followers: string[];
  following: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserParams {
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  headerImage?: string;
  location?: string;
  website?: string;
  birthdate?: string;
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * 指定されたユーザーIDのユーザー情報を取得
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users?userId=${userId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * 複数のユーザーIDからユーザー情報を取得
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  try {
    const users = await Promise.all(
      userIds.map((id) => getUserById(id))
    );
    return users.filter((user): user is User => user !== null);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  updates: UpdateUserParams
): Promise<User | null> {
  try {
    const response = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update user");
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

