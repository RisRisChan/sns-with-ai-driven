# useFormState を使った Server Actions のリファクタリング

このドキュメントでは、`useFormState`と`useFormStatus`を使った新しい実装方法について説明します。

## 概要

React の`useFormState`フックを使用することで、Server Actions とフォームの状態管理がより簡潔になります。

### メリット

1. **自動的な送信状態の管理**: `useFormStatus`で`pending`状態を取得
2. **シンプルなエラーハンドリング**: Server Action の戻り値で状態を管理
3. **Progressive Enhancement**: JavaScript が無効でも動作（基本的なフォーム送信）
4. **型安全性**: TypeScript との統合

## 実装ファイル

### 1. Server Actions (`lib/actions/posts.ts`)

以下の3つの FormData ベースの Server Actions を実装：

- `createPostActionWithFormData`: 投稿作成
- `toggleLikeActionWithFormData`: いいねのトグル
- `deletePostActionWithFormData`: 投稿削除

#### 特徴

```typescript
// FormData ベースの Server Action の署名
export async function createPostActionWithFormData(
  prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState>
```

- `prevState`: 前回の状態（初回は初期状態）
- `formData`: フォームから送信されたデータ
- 戻り値: 新しい状態

### 2. PostForm コンポーネント (`components/PostFormWithAction.tsx`)

`useFormState`を使用した投稿フォームコンポーネント。

#### 使用例

```tsx
import PostFormWithAction from "@/components/PostFormWithAction";

function HomePage({ user }) {
  const handleSuccess = (post) => {
    console.log("投稿成功:", post);
    // タイムラインを更新するなどの処理
  };

  return (
    <PostFormWithAction
      user={user}
      placeholder="いまどうしてる？"
      onSuccess={handleSuccess}
    />
  );
}
```

#### Props

- `user`: ユーザー情報
- `replyToId?`: 返信先の投稿 ID（返信の場合）
- `onCancel?`: キャンセル時のコールバック
- `placeholder?`: プレースホルダーテキスト
- `onSuccess?`: 投稿成功時のコールバック

#### 内部実装のポイント

```tsx
const [state, formAction] = useFormState(
  createPostActionWithFormData,
  initialState
);

// フォームに action を指定
<form ref={formRef} action={formAction}>
  {/* フォームフィールド */}
</form>
```

- `useFormState`で Server Action とフォームを接続
- `state`で送信結果を取得
- `formAction`をフォームの`action`に指定

### 3. カスタムフック (`hooks/usePostActionsWithFormState.ts`)

いいねと削除アクションを管理するカスタムフック。

#### 使用例

```tsx
import { usePostActionsWithFormState } from "@/hooks/usePostActionsWithFormState";

function PostCard({ post, currentUserId }) {
  const {
    isLiked,
    likesCount,
    isDeleting,
    likeAction,
    deleteAction,
    postId,
  } = usePostActionsWithFormState({
    postId: post.id,
    initialLiked: post.likes.includes(currentUserId),
    initialLikesCount: post.likes.length,
    currentUserId,
    onLike: (postId) => console.log("Liked:", postId),
    onDelete: (postId) => console.log("Deleted:", postId),
  });

  return (
    <div>
      {/* いいねフォーム */}
      <form action={likeAction}>
        <input type="hidden" name="postId" value={postId} />
        <button type="submit">
          {isLiked ? "❤️" : "🤍"} {likesCount}
        </button>
      </form>

      {/* 削除フォーム */}
      <form action={deleteAction}>
        <input type="hidden" name="postId" value={postId} />
        <button type="submit">削除</button>
      </form>
    </div>
  );
}
```

### 4. PostActions コンポーネント (`components/PostCard/PostActionsWithFormState.tsx`)

`useFormStatus`を使った投稿アクションコンポーネント。

#### 特徴

```tsx
function LikeButton({ isLiked, likesCount }) {
  const { pending } = useFormStatus();

  return (
    <>
      {/* いいねアイコン */}
      {pending && <span>...</span>}
    </>
  );
}
```

- `useFormStatus`で送信中の状態を取得
- ボタン内で`pending`状態を表示

## 従来版との比較

### 従来版（API Route + fetch）

```tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, imageUrl }),
    });

    if (!response.ok) throw new Error();

    const data = await response.json();
    // 成功処理
  } catch (error) {
    // エラー処理
  } finally {
    setIsSubmitting(false);
  }
};
```

### 新しい方法（useFormState）

```tsx
const [state, formAction] = useFormState(
  createPostActionWithFormData,
  initialState
);

useEffect(() => {
  if (state.success) {
    // 成功処理
  }
  if (state.error) {
    // エラー処理
  }
}, [state]);

return <form action={formAction}>{/* フォームフィールド */}</form>;
```

### メリット

1. **コードの簡潔性**: fetch や状態管理のボイラープレートが不要
2. **Progressive Enhancement**: JavaScript なしでも基本動作が可能
3. **自動的な状態管理**: `pending`状態の自動管理
4. **型安全性**: Server Action の戻り値の型チェック
5. **パフォーマンス**: `revalidatePath`による効率的なキャッシュ管理

## マイグレーションガイド

### ステップ 1: Server Actions を作成

既存の API Route から Server Actions に移行：

```typescript
// Before: app/api/posts/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // ...
}

// After: lib/actions/posts.ts
export async function createPostActionWithFormData(
  prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const content = formData.get("content") as string;
  // ...
}
```

### ステップ 2: コンポーネントを更新

フォームコンポーネントで`useFormState`を使用：

```tsx
// Before
const [isSubmitting, setIsSubmitting] = useState(false);
const handleSubmit = async (e) => {
  e.preventDefault();
  // fetch処理
};

// After
const [state, formAction] = useFormState(action, initialState);
<form action={formAction}>{/* ... */}</form>;
```

### ステップ 3: テスト

- フォーム送信が正常に動作するか確認
- エラーハンドリングが適切に機能するか確認
- `pending`状態の表示が正しいか確認

## ベストプラクティス

1. **エラーメッセージの表示**

```tsx
useEffect(() => {
  if (state.error) {
    alert(state.error); // または toast などを使用
  }
}, [state.error]);
```

2. **フォームのリセット**

```tsx
useEffect(() => {
  if (state.success) {
    formRef.current?.reset();
    setContent("");
  }
}, [state.success]);
```

3. **楽観的更新**

```tsx
const handleLike = () => {
  // UI をすぐに更新
  setIsLiked(!isLiked);
  setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
};
```

4. **Hidden フィールドの使用**

```tsx
<form action={formAction}>
  <input type="hidden" name="replyToId" value={replyToId} />
  <input type="hidden" name="imageUrl" value={imageUrl} />
  {/* 他のフィールド */}
</form>
```

## 注意事項

- `useFormState`と`useFormStatus`は React 19 / Next.js 14 以降で使用可能
- Server Actions は必ず`"use server"`ディレクティブを含める
- FormData ベースのため、複雑なオブジェクトは JSON.stringify が必要
- `revalidatePath`を使用してキャッシュを適切に管理

## まとめ

`useFormState`を使うことで：

- ✅ コードがより簡潔に
- ✅ 状態管理が自動化
- ✅ エラーハンドリングが統一
- ✅ Progressive Enhancement に対応
- ✅ パフォーマンスが向上

従来の API Route + fetch パターンから移行することで、より保守性の高いコードになります。

