# Supabase Storage クイックスタート

## 最短セットアップ（5分）

### 1. Supabaseプロジェクト作成
```
https://supabase.com/ → Sign Up → New Project
```

### 2. Storageバケット作成
```
Dashboard → Storage → New Bucket
  - Name: user-uploads
  - Public: ✓ ON
  → Create
```

### 3. ポリシー設定（SQL Editor）
```
Dashboard → SQL Editor → New Query
```

以下のSQLを実行：

```sql
-- 読み取り許可（全員）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- アップロード許可（認証済みユーザー）
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

-- 削除許可（所有者のみ）
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads');
```

### 4. 環境変数設定

`.env.local`を作成：

```bash
# Supabase Dashboard → Settings → API で確認
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
```

### 5. 開発サーバー再起動

```bash
npm run dev
```

## 確認方法

1. ログイン後、プロフィール編集ページに移動
2. 「画像を選択」ボタンをクリック
3. 画像ファイル（最大5MB）を選択
4. アップロード成功メッセージが表示される
5. プレビューが更新される
6. 「保存」をクリックして確定

## トラブルシューティング

### ⚠️ 環境変数が設定されていません

→ `.env.local`ファイルが存在し、正しい値が設定されているか確認
→ 開発サーバーを再起動

### ❌ アップロードエラー

→ Storageバケットが「Public」になっているか確認
→ ポリシーが正しく設定されているか確認
→ ファイルサイズが5MB以下か確認

### 🖼️ 画像が表示されない

→ ブラウザのコンソール（F12）でエラーを確認
→ Supabaseダッシュボードで画像がアップロードされているか確認
→ バケットの公開設定を確認

## 完了！

これで画像アップロード機能が使えます。

詳細な設定については `SUPABASE_SETUP.md` を参照してください。

