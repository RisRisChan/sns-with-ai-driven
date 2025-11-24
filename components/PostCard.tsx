"use client";

import type { PostCardProps, Post } from "@/types/post";
import { usePostActions } from "@/hooks/usePostActions";
import UserAvatar from "@/components/PostCard/UserAvatar";
import PostHeader from "@/components/PostCard/PostHeader";
import PostContent from "@/components/PostCard/PostContent";
import PostActions from "@/components/PostCard/PostActions";
import ReplyForm from "@/components/PostCard/ReplyForm";

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  isReply = false,
  replyingToPostId,
  onShowReplyForm,
  onCancelReply,
  currentUser,
  onPostSubmit,
}: PostCardProps) {
  const { isLiked, likesCount, isDeleting, handleLike, handleDelete } =
    usePostActions({
      postId: post.id,
      initialLiked: currentUserId ? post.likes.includes(currentUserId) : false,
      initialLikesCount: post.likes.length,
      currentUserId,
      onLike: () => onLike(post.id),
      onDelete: () => onDelete(post.id),
    });

  if (!post.user) return null;

  const handleReplyClick = () => {
    if (onShowReplyForm && currentUser) {
      onShowReplyForm(post.id, post.user?.id);
    } else {
      onReply(post.id, post.user?.id);
    }
  };

  const showReplyForm =
    replyingToPostId === post.id && currentUser && onPostSubmit;

  const postCardProps = {
    currentUserId,
    onLike,
    onDelete,
    onReply,
    replyingToPostId,
    onShowReplyForm,
    onCancelReply,
    currentUser,
    onPostSubmit,
  };

  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-800 ${
        isReply ? "pl-12" : ""
      }`}
    >
      <div className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <UserAvatar user={post.user} />
        <div className="flex-1 min-w-0">
          <PostHeader post={post} user={post.user} />
          <PostContent post={post} />
          <PostActions
            post={post}
            currentUserId={currentUserId}
            isLiked={isLiked}
            likesCount={likesCount}
            repliesCount={post.replies?.length || 0}
            isDeleting={isDeleting}
            onLike={handleLike}
            onDelete={handleDelete}
            onReply={handleReplyClick}
          />
          {showReplyForm && (
            <ReplyForm
              post={post}
              currentUser={currentUser}
              onPostSubmit={onPostSubmit}
              onCancel={onCancelReply}
            />
          )}
          {!isReply && post.replies && post.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.replies.map((reply) => (
                <PostCard
                  key={reply.id}
                  post={reply as Post}
                  isReply={true}
                  {...postCardProps}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
