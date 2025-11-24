export interface User {
  id: string;
  username: string;
  displayName: string;
  profileImage: string;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: string[];
  user?: User;
}

export interface Post {
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

export interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReply: (postId: string, replyToUserId?: string) => void;
  isReply?: boolean;
  replyingToPostId?: string | null;
  onShowReplyForm?: (postId: string, replyToUserId?: string) => void;
  onCancelReply?: () => void;
  currentUser?: User;
  onPostSubmit?: (
    content: string,
    imageUrl?: string,
    replyToId?: string
  ) => Promise<void>;
}

