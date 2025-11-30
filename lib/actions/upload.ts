"use server";

import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/db-helpers";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * 画像をSupabase Storageにアップロードする
 */
export async function uploadImage(
  formData: FormData
): Promise<UploadImageResult> {
  try {
    // Supabase設定チェック
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          "Supabaseが設定されていません。SUPABASE_QUICKSTART.mdを参照してください。",
      };
    }

    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "ファイルが選択されていません" };
    }

    // ファイルサイズチェック（5MB以下）
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: "ファイルサイズが大きすぎます（最大5MB）",
      };
    }

    // ファイルタイプチェック
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "サポートされていないファイル形式です（JPEG, PNG, WebPのみ）",
      };
    }

    // ファイル名を生成（ユーザーID + タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${timestamp}-${randomStr}.${fileExt}`;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: `アップロードエラー: ${error.message}` };
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    console.log("✅ 画像アップロード成功:", { fileName, url: publicUrl });

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: "画像のアップロード中にエラーが発生しました",
    };
  }
}

/**
 * 古い画像をSupabase Storageから削除する
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // 認証チェック
    const user = await getOrCreateUser();
    if (!user) {
      return false;
    }

    // URLからファイルパスを抽出
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const filePath = `${user.id}/${fileName}`;

    // Supabase Storageから削除
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }

    console.log("✅ 画像削除成功:", filePath);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

