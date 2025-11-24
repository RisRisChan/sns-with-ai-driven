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

  let user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
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
  }

  return user;
}
