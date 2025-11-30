# Supabase Storage 画像アップロード設定

このプロジェクトでは、プロフィール画像とカバー画像のアップロードにSupabase Storageを使用しています。

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成

### 2. Storageバケットの作成

1. Supabaseダッシュボードで「Storage」を選択
2. 「New Bucket」をクリック
3. バケット名を`user-uploads`に設定
4. 「Public bucket」を有効にする（画像を公開アクセス可能にする）
5. 「Create bucket」をクリック

### 3. バケットのポリシー設定

Storage Policies を設定して、認証されたユーザーがアップロードできるようにします：

#### アップロードポリシー（INSERT）

```sql
CREATE POLICY "認証されたユーザーはアップロード可能"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');
```

#### 読み取りポリシー（SELECT）

```sql
CREATE POLICY "誰でも読み取り可能"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');
```

#### 削除ポリシー（DELETE）

```sql
CREATE POLICY "自分のファイルは削除可能"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を追加：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### 環境変数の取得方法

1. Supabaseダッシュボードで「Settings」→「API」を選択
2. 「Project URL」をコピーして`NEXT_PUBLIC_SUPABASE_URL`に設定
3. 「Project API keys」の「anon public」キーをコピーして`NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

### 5. 開発サーバーを再起動

```bash
npm run dev
```

## 使用方法

### プロフィール編集ページでの画像アップロード

1. `/users/[userId]/edit`にアクセス
2. カバー画像またはプロフィール画像の「画像を選択」ボタンをクリック
3. 画像ファイル（JPEG, PNG, WebP）を選択（最大5MB）
4. 自動的にSupabase Storageにアップロードされます
5. プレビューが表示され、URLが自動入力されます
6. 「保存」ボタンをクリックしてプロフィールを更新

## 仕様

### 対応ファイル形式
- JPEG / JPG
- PNG
- WebP

### ファイルサイズ制限
- 最大5MB

### ファイル名の形式
- `{userId}/{timestamp}-{random}.{ext}`
- 例: `user_abc123/1701234567890-x9k2m5p.jpg`

### セキュリティ
- ファイルはユーザーIDごとのフォルダに保存
- 認証されたユーザーのみアップロード可能
- ユーザーは自分のファイルのみ削除可能
- すべてのファイルは公開読み取り可能（プロフィール画像のため）

## トラブルシューティング

### アップロードエラー

**エラー: "認証が必要です"**
- Clerkでログインしているか確認
- セッションをリフレッシュ（ページを再読み込み）

**エラー: "ファイルサイズが大きすぎます"**
- 画像ファイルを5MB以下に圧縮
- [TinyPNG](https://tinypng.com/)などのツールを使用

**エラー: "アップロードエラー: ..."**
- Supabaseの環境変数が正しく設定されているか確認
- Storage Policiesが正しく設定されているか確認
- Supabaseダッシュボードでバケットが存在するか確認

### 画像が表示されない

1. ブラウザの開発者ツール（F12）でネットワークタブを確認
2. 画像URLが正しいか確認
3. Supabaseバケットが「Public」に設定されているか確認
4. Storage Policiesで読み取りが許可されているか確認

## 参考リンク

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)

