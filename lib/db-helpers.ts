import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface CreateUserParams {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  headerImage?: string;
}

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  // WebhookでユーザーがまだClerk側で作成されていない場合を考慮して
  // データベースでユーザーを検索
  let user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
  });

  // Webhookがまだ実行されていない場合のフォールバック
  // （開発環境やWebhook設定前のユーザー向け）
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    try {
      user = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email,
          username: clerkUser.username || clerkUser.id.substring(0, 8),
          displayName:
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.username || "User",
          bio: "",
          profileImage:
            clerkUser.imageUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${clerkUser.id}`,
          headerImage: `https://picsum.photos/800/200?random=${clerkUser.id}`,
        },
      });
      console.log("⚠️ User created via fallback (Webhook may not be set up)");
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  return user;
}
