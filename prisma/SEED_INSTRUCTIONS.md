# シードデータの挿入方法

このドキュメントでは、SupabaseのSQLエディタを使用してシードデータを挿入する方法を説明します。

## 手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択

### 2. SQLエディタを開く

1. 左側のメニューから「SQL Editor」をクリック
2. 「New query」をクリックして新しいクエリを作成

### 3. シードデータのSQLを実行

1. `prisma/seed.sql` ファイルの内容をコピー
2. SQLエディタに貼り付け
3. 「Run」ボタンをクリックして実行

## 注意事項

### 既存データがある場合

既存のデータを削除してからシードデータを挿入したい場合は、`seed.sql` ファイルの先頭にある以下のコメントを外してください：

```sql
-- 既存のデータを削除（オプション：既存データがある場合）
DELETE FROM likes;
DELETE FROM follows;
DELETE FROM posts;
DELETE FROM users;
```

**注意**: この操作は既存のデータをすべて削除します。本番環境では実行しないでください。

### データの内容

シードデータには以下が含まれます：

- **ユーザー**: 3人（alice, bob, charlie）
- **投稿**: 35件（通常の投稿）+ 1件（返信）
- **フォロー関係**: 4件
- **いいね**: 56件

### エラーが発生した場合

- テーブルが存在しない場合は、先に `npm run db:push` または `npm run db:migrate` を実行してテーブルを作成してください
- 既にデータが存在する場合は、`ON CONFLICT DO NOTHING` により重複エラーは発生しません

## 確認方法

データが正しく挿入されたか確認するには：

1. Supabaseダッシュボードの「Table Editor」から各テーブルを確認
2. または、以下のSQLクエリを実行：

```sql
-- ユーザー数を確認
SELECT COUNT(*) FROM users;

-- 投稿数を確認
SELECT COUNT(*) FROM posts;

-- フォロー数を確認
SELECT COUNT(*) FROM follows;

-- いいね数を確認
SELECT COUNT(*) FROM likes;
```

