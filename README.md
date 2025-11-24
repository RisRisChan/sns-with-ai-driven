# SNS with AI Driven

X（旧 Twitter）のようなタイムライン機能を持つ SNS アプリケーションです。

## 機能

### ユーザー認証・管理

- ユーザー登録（メールアドレス、パスワード、Clerk 認証）
- ログイン/ログアウト
- プロフィール表示
- プロフィール編集（ユーザー名、表示名、自己紹介、プロフィール画像、ヘッダー画像）

### 投稿機能

- テキスト投稿（文字数制限: 280 文字）
- 投稿の削除
- 投稿一覧表示
- 返信機能（投稿に対する返信、返信のネスト表示、返信数表示）

### タイムライン

- ホームタイムライン（時系列順、フォロー中のユーザー + 自分の投稿）
- ユーザー個別のタイムライン

### インタラクション

- いいね機能（いいね/取り消し/数表示）

### フォロー機能

- ユーザーフォロー/解除
- フォロワー数/フォロー中数表示
- フォロワー一覧/フォロー中一覧

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Clerk 認証の設定

1. [Clerk Dashboard](https://dashboard.clerk.com/) にアクセスしてアカウントを作成
2. 新しいアプリケーションを作成
3. API Keys を取得
4. `.env.local` ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Supabase データベースの設定

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの「Settings」→「Database」に移動
4. 接続文字列を取得
5. `.env.local` ファイルに以下の環境変数を追加：

```env
# Supabase Database接続文字列
# 通常の接続（アプリケーション用）
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# または、直接接続（マイグレーション用）
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**注意**: `[YOUR-PASSWORD]` と `[YOUR-PROJECT-REF]` を実際の値に置き換えてください。

### 4. Prisma のセットアップ

1. Prisma Client を生成：

```bash
npm run db:generate
```

2. データベースにスキーマを適用：

```bash
# 開発環境（スキーマを直接プッシュ）
npm run db:push

# または、マイグレーションを使用（推奨）
npm run db:migrate
```

3. （オプション）Prisma Studio でデータベースを確認：

```bash
npm run db:studio
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 技術スタック

- **Next.js 16** - React フレームワーク
- **Clerk** - 認証サービス
- **Supabase** - PostgreSQL データベース
- **Prisma** - ORM（Object-Relational Mapping）
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **date-fns** - 日付フォーマット

## データベース

このプロジェクトは **Supabase（PostgreSQL）** と **Prisma** を使用してデータを管理します。

### データベーススキーマ

- **User** - ユーザー情報
- **Post** - 投稿情報
- **Follow** - フォロー関係
- **Like** - いいね情報

### Prisma コマンド

- `npm run db:generate` - Prisma Client を生成
- `npm run db:push` - スキーマをデータベースに直接プッシュ（開発用）
- `npm run db:migrate` - マイグレーションを作成・適用（推奨）
- `npm run db:studio` - Prisma Studio を起動（データベースの可視化）

## ライセンス

MIT
