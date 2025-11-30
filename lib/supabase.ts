import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase環境変数が設定されていません。画像アップロード機能が動作しません。\n" +
      "詳細は SUPABASE_QUICKSTART.md を参照してください。"
  );
}

// ダミーのURLとキーでクライアントを初期化（エラー防止）
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Storageバケット名
export const STORAGE_BUCKET = "user-uploads";

