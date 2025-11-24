import Image from "next/image";
import Link from "next/link";
import type { User } from "@/types/post";

interface UserAvatarProps {
  user: User;
  size?: number;
}

export default function UserAvatar({ user, size = 48 }: UserAvatarProps) {
  return (
    <Link href={`/users/${user.id}`}>
      <Image
        src={user.profileImage}
        alt={user.displayName}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0 cursor-pointer"
      />
    </Link>
  );
}

