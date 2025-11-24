// ダミーデータ管理システム

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  headerImage: string;
  followers: string[];
  following: string[];
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: string[];
  replies: string[];
  replyToId?: string;
  replyToUserId?: string;
}

// メモリ内データストア
class DataStore {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    // ダミーユーザーの作成
    const dummyUsers: User[] = [
      {
        id: "user1",
        email: "alice@example.com",
        username: "alice",
        displayName: "Alice",
        bio: "Hello, I am Alice!",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        headerImage: "https://picsum.photos/800/200?random=1",
        followers: ["user2", "user3"],
        following: ["user2"],
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "user2",
        email: "bob@example.com",
        username: "bob",
        displayName: "Bob",
        bio: "Developer and tech enthusiast",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        headerImage: "https://picsum.photos/800/200?random=2",
        followers: ["user1", "user3"],
        following: ["user1", "user3"],
        createdAt: new Date("2024-01-02"),
      },
      {
        id: "user3",
        email: "charlie@example.com",
        username: "charlie",
        displayName: "Charlie",
        bio: "Designer and artist",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
        headerImage: "https://picsum.photos/800/200?random=3",
        followers: ["user1", "user2"],
        following: ["user2"],
        createdAt: new Date("2024-01-03"),
      },
    ];

    dummyUsers.forEach((user) => this.users.set(user.id, user));

    // ダミーポストの作成
    const dummyPosts: Post[] = [
      {
        id: "post1",
        userId: "user1",
        content: "Hello, world! This is my first post. #excited",
        createdAt: new Date(Date.now() - 3600000),
        likes: ["user2", "user3"],
        replies: ["reply1"],
        replyToId: undefined,
      },
      {
        id: "reply1",
        userId: "user2",
        content: "Great post, Alice!",
        createdAt: new Date(Date.now() - 1800000),
        likes: ["user1"],
        replies: [],
        replyToId: "post1",
        replyToUserId: "user1",
      },
      {
        id: "post2",
        userId: "user2",
        content:
          "Just finished working on a new project. Can't wait to share it with everyone!",
        createdAt: new Date(Date.now() - 7200000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post3",
        userId: "user3",
        content: "Beautiful sunset today! 🌅",
        createdAt: new Date(Date.now() - 10800000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
    ];

    dummyPosts.forEach((post) => this.posts.set(post.id, post));
    this.initialized = true;
  }

  // ユーザー関連メソッド
  getUser(userId: string): User | undefined {
    this.initialize();
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    this.initialize();
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  createUser(user: Omit<User, "followers" | "following" | "createdAt">): User {
    this.initialize();
    const newUser: User = {
      ...user,
      followers: [],
      following: [],
      createdAt: new Date(),
    };
    this.users.set(user.id, newUser);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    this.initialize();
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  getAllUsers(): User[] {
    this.initialize();
    return Array.from(this.users.values());
  }

  // フォロー関連メソッド
  followUser(followerId: string, followingId: string): void {
    this.initialize();
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    if (follower && following && followerId !== followingId) {
      if (!follower.following.includes(followingId)) {
        follower.following.push(followingId);
      }
      if (!following.followers.includes(followerId)) {
        following.followers.push(followerId);
      }
    }
  }

  unfollowUser(followerId: string, followingId: string): void {
    this.initialize();
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    if (follower && following) {
      follower.following = follower.following.filter(
        (id) => id !== followingId
      );
      following.followers = following.followers.filter(
        (id) => id !== followerId
      );
    }
  }

  // 投稿関連メソッド
  getPost(postId: string): Post | undefined {
    this.initialize();
    return this.posts.get(postId);
  }

  getPostsByUser(userId: string): Post[] {
    this.initialize();
    return Array.from(this.posts.values())
      .filter((post) => post.userId === userId && !post.replyToId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getRepliesToPost(postId: string): Post[] {
    this.initialize();
    return Array.from(this.posts.values())
      .filter((post) => post.replyToId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getHomeTimeline(userId: string): Post[] {
    this.initialize();
    const user = this.users.get(userId);
    if (!user) return [];

    const followingIds = [...user.following, userId]; // 自分の投稿も含む
    return Array.from(this.posts.values())
      .filter((post) => followingIds.includes(post.userId) && !post.replyToId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  createPost(post: Omit<Post, "id" | "createdAt" | "likes" | "replies">): Post {
    this.initialize();
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      likes: [],
      replies: [],
    };
    this.posts.set(newPost.id, newPost);

    // 返信の場合は親投稿のrepliesに追加
    if (newPost.replyToId) {
      const parentPost = this.posts.get(newPost.replyToId);
      if (parentPost) {
        parentPost.replies.push(newPost.id);
      }
    }

    return newPost;
  }

  deletePost(postId: string, userId: string): boolean {
    this.initialize();
    const post = this.posts.get(postId);
    if (!post || post.userId !== userId) return false;

    // 返信の場合は親投稿のrepliesから削除
    if (post.replyToId) {
      const parentPost = this.posts.get(post.replyToId);
      if (parentPost) {
        parentPost.replies = parentPost.replies.filter((id) => id !== postId);
      }
    }

    this.posts.delete(postId);
    return true;
  }

  likePost(postId: string, userId: string): void {
    this.initialize();
    const post = this.posts.get(postId);
    if (post && !post.likes.includes(userId)) {
      post.likes.push(userId);
    }
  }

  unlikePost(postId: string, userId: string): void {
    this.initialize();
    const post = this.posts.get(postId);
    if (post) {
      post.likes = post.likes.filter((id) => id !== userId);
    }
  }

  getAllPosts(): Post[] {
    this.initialize();
    return Array.from(this.posts.values())
      .filter((post) => !post.replyToId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// シングルトンインスタンス
export const dataStore = new DataStore();
