# Clerk Webhook セットアップガイド

## 概要
このプロジェクトでは、Clerk Webhookを使用してユーザーイベントをSupabaseデータベースと同期しています。

## Webhookが処理するイベント

- **user.created** - Clerkでユーザーが作成されたとき → Supabaseにユーザーレコードを作成
- **user.updated** - Clerkでユーザー情報が更新されたとき → Supabaseのユーザーレコードを更新
- **user.deleted** - Clerkでユーザーが削除されたとき → Supabaseのユーザーレコードを削除

## 本番環境での設定

### 1. Clerk Dashboard で Webhook を設定

1. [Clerk Dashboard](https://dashboard.clerk.com) にログイン
2. プロジェクトを選択
3. 左側メニューから **Webhooks** をクリック
4. **+ Add Endpoint** をクリック
5. 以下を設定：
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
   - **Subscribe to events**:
     - ✅ user.created
     - ✅ user.updated
     - ✅ user.deleted
6. **Create** をクリック
7. **Signing Secret** をコピー

### 2. 環境変数を設定

`.env` または本番環境の環境変数に追加：

```bash
CLERK_WEBHOOK_SECRET=whsec_あなたのシークレット
```

### 3. デプロイ後の確認

1. Clerk Dashboardの Webhooks ページで、エンドポイントのステータスを確認
2. テストユーザーを作成して、Webhookが正しく動作するか確認
3. Supabaseでユーザーレコードが作成されているか確認

## 開発環境での設定（ngrok使用）

ローカル開発環境でWebhookをテストする場合：

### 1. ngrokをインストール

```bash
# Homebrewの場合
brew install ngrok

# または公式サイトからダウンロード
# https://ngrok.com/download
```

### 2. ngrokで公開URLを作成

```bash
# ターミナルで実行
ngrok http 3000
```

表示されたURL（例: `https://abc123.ngrok.io`）をコピー

### 3. Clerk Dashboard で設定

Endpoint URL: `https://abc123.ngrok.io/api/webhooks/clerk`

**注意**: ngrokの無料プランでは、セッションごとにURLが変わるため、再起動するたびにClerk DashboardのURLを更新する必要があります。

## トラブルシューティング

### Webhookが動作しない場合

1. **環境変数を確認**
   ```bash
   echo $CLERK_WEBHOOK_SECRET
   ```

2. **開発サーバーを再起動**
   ```bash
   # Ctrl+C で停止
   npm run dev
   ```

3. **Clerk Dashboard でログを確認**
   - Webhooks → エンドポイントをクリック → Logs

4. **ターミナルでログを確認**
   - ユーザー作成時に `✅ User created: {userId}` が表示されるか確認

### エラーメッセージ

- **"Error occurred -- no svix headers"**
  → Webhookリクエストが正しく送信されていません

- **"Error verifying webhook"**
  → CLERK_WEBHOOK_SECRET が間違っているか、設定されていません

- **"Failed to create user"**
  → データベース接続またはスキーマの問題を確認

## フォールバック機能

Webhookが設定されていない場合でも、`getOrCreateUser()` 関数が初回API呼び出し時にユーザーを作成します（JIT作成）。

この機能により、以下の場合でもアプリケーションは動作します：
- Webhook設定前の開発環境
- Webhook設定のトラブル時
- 既存ユーザーの移行期間

## 参考リンク

- [Clerk Webhooks ドキュメント](https://clerk.com/docs/integrations/webhooks/overview)
- [Svix ドキュメント](https://docs.svix.com/)

