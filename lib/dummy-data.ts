// ダミーデータ管理システム

export interface User {
  id: string;
  email: string;
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
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
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
        location: "Tokyo, Japan",
        website: "https://alice.dev",
        birthdate: "1994-04-15",
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
        location: "Osaka, Japan",
        website: "https://bob.codes",
        birthdate: "1992-08-05",
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
        location: "Fukuoka, Japan",
        website: "https://charlie.art",
        birthdate: "1996-12-22",
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
        imageUrl: "https://picsum.photos/800/600?random=sunset",
        createdAt: new Date(Date.now() - 10800000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post4",
        userId: "user1",
        content: "Check out this amazing view!",
        imageUrl: "https://picsum.photos/800/600?random=mountain",
        createdAt: new Date(Date.now() - 14400000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post5",
        userId: "user2",
        content: "Working on something exciting! 🚀",
        imageUrl: "https://picsum.photos/800/600?random=tech",
        createdAt: new Date(Date.now() - 18000000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post6",
        userId: "user3",
        content: "今日は良い天気ですね！散歩に行ってきました。",
        imageUrl: "https://picsum.photos/800/600?random=walk",
        createdAt: new Date(Date.now() - 21600000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post7",
        userId: "user1",
        content: "新しい本を読み始めました。とても面白いです！",
        createdAt: new Date(Date.now() - 25200000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post8",
        userId: "user2",
        content: "コーヒーを飲みながらコーディング中 ☕",
        imageUrl: "https://picsum.photos/800/600?random=coffee",
        createdAt: new Date(Date.now() - 28800000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post9",
        userId: "user3",
        content: "週末の計画を立てています。どこに行こうかな？",
        createdAt: new Date(Date.now() - 32400000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post10",
        userId: "user1",
        content: "美味しいランチを食べました！🍽️",
        imageUrl: "https://picsum.photos/800/600?random=food",
        createdAt: new Date(Date.now() - 36000000),
        likes: ["user2", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post11",
        userId: "user2",
        content:
          "今日学んだことをシェアします。React Hooksは本当に便利ですね！",
        createdAt: new Date(Date.now() - 39600000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post12",
        userId: "user3",
        content: "アート作品を作成中です。完成が楽しみ！",
        imageUrl: "https://picsum.photos/800/600?random=art",
        createdAt: new Date(Date.now() - 43200000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post13",
        userId: "user1",
        content: "朝の散歩は気持ちいいですね。🌅",
        imageUrl: "https://picsum.photos/800/600?random=morning",
        createdAt: new Date(Date.now() - 46800000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post14",
        userId: "user2",
        content: "新しいプロジェクトを始めました。ワクワクしています！",
        createdAt: new Date(Date.now() - 50400000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post15",
        userId: "user3",
        content: "音楽を聴きながら作業しています。🎵",
        createdAt: new Date(Date.now() - 54000000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post16",
        userId: "user1",
        content: "今日は運動をしました。気分がスッキリ！",
        imageUrl: "https://picsum.photos/800/600?random=exercise",
        createdAt: new Date(Date.now() - 57600000),
        likes: ["user2", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post17",
        userId: "user2",
        content:
          "コードレビューをしています。良いコードを書くのは難しいですね。",
        createdAt: new Date(Date.now() - 61200000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post18",
        userId: "user3",
        content: "新しいデザインのアイデアが浮かびました！",
        imageUrl: "https://picsum.photos/800/600?random=design",
        createdAt: new Date(Date.now() - 64800000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post19",
        userId: "user1",
        content: "友達と会って楽しい時間を過ごしました。",
        createdAt: new Date(Date.now() - 68400000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post20",
        userId: "user2",
        content: "バグを修正しました。やっと動くようになった！",
        createdAt: new Date(Date.now() - 72000000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post21",
        userId: "user3",
        content: "今日の夕日が綺麗でした。🌇",
        imageUrl: "https://picsum.photos/800/600?random=sunset2",
        createdAt: new Date(Date.now() - 75600000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post22",
        userId: "user1",
        content: "読書の時間。静かな時間が好きです。",
        imageUrl: "https://picsum.photos/800/600?random=book",
        createdAt: new Date(Date.now() - 79200000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post23",
        userId: "user2",
        content: "新しい技術を学んでいます。毎日が勉強ですね。",
        createdAt: new Date(Date.now() - 82800000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post24",
        userId: "user3",
        content: "カフェで作業中。集中できます。",
        imageUrl: "https://picsum.photos/800/600?random=cafe",
        createdAt: new Date(Date.now() - 86400000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post25",
        userId: "user1",
        content: "週末は何をしようかな？",
        createdAt: new Date(Date.now() - 90000000),
        likes: ["user2", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post26",
        userId: "user2",
        content: "オープンソースプロジェクトに貢献しました！",
        imageUrl: "https://picsum.photos/800/600?random=code",
        createdAt: new Date(Date.now() - 93600000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post27",
        userId: "user3",
        content: "新しいアートスタイルを試しています。",
        createdAt: new Date(Date.now() - 97200000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post28",
        userId: "user1",
        content: "美味しいケーキを食べました！🍰",
        imageUrl: "https://picsum.photos/800/600?random=cake",
        createdAt: new Date(Date.now() - 100800000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post29",
        userId: "user2",
        content: "テストを書いています。品質を保つために重要ですね。",
        createdAt: new Date(Date.now() - 104400000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post30",
        userId: "user3",
        content: "今日のインスピレーション。",
        imageUrl: "https://picsum.photos/800/600?random=inspiration",
        createdAt: new Date(Date.now() - 108000000),
        likes: ["user1", "user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post31",
        userId: "user1",
        content: "朝のルーティンを確立しました。生産性が上がります！",
        createdAt: new Date(Date.now() - 111600000),
        likes: ["user2"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post32",
        userId: "user2",
        content: "新しいライブラリを試しています。便利そう！",
        imageUrl: "https://picsum.photos/800/600?random=library",
        createdAt: new Date(Date.now() - 115200000),
        likes: ["user1", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post33",
        userId: "user3",
        content: "デザインの勉強会に参加しました。学びが多かったです。",
        createdAt: new Date(Date.now() - 118800000),
        likes: ["user1"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post34",
        userId: "user1",
        content: "今日のランチ。美味しかった！",
        imageUrl: "https://picsum.photos/800/600?random=lunch",
        createdAt: new Date(Date.now() - 122400000),
        likes: ["user2", "user3"],
        replies: [],
        replyToId: undefined,
      },
      {
        id: "post35",
        userId: "user2",
        content: "コードをリファクタリングしました。読みやすくなった！",
        createdAt: new Date(Date.now() - 126000000),
        likes: ["user1"],
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
      location: user.location || "",
      website: user.website || "",
      birthdate: user.birthdate || "",
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
