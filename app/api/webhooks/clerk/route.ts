import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Webhook署名検証用のシークレットキーを取得
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  // Webhookヘッダーを取得
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // ヘッダーがない場合はエラー
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // リクエストボディを取得
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Svixインスタンスを作成
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Webhook署名を検証
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // イベントタイプを取得
  const eventType = evt.type;

  // user.created イベント - ユーザーが作成されたとき
  if (eventType === "user.created") {
    const { id, email_addresses, username, first_name, last_name, image_url } =
      evt.data;

    try {
      await prisma.user.create({
        data: {
          id: id,
          email: email_addresses[0]?.email_address || "",
          username: username || id.substring(0, 8),
          displayName:
            first_name && last_name
              ? `${first_name} ${last_name}`
              : username || "User",
          bio: "",
          profileImage:
            image_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
          headerImage: `https://picsum.photos/800/200?random=${id}`,
        },
      });

      console.log(`✅ User created: ${id}`);
    } catch (error) {
      console.error("Error creating user in database:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  // user.updated イベント - ユーザー情報が更新されたとき
  if (eventType === "user.updated") {
    const { id, email_addresses, username, first_name, last_name, image_url } =
      evt.data;

    try {
      await prisma.user.update({
        where: { id: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          username: username || id.substring(0, 8),
          displayName:
            first_name && last_name
              ? `${first_name} ${last_name}`
              : username || "User",
          profileImage:
            image_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        },
      });

      console.log(`✅ User updated: ${id}`);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  }

  // user.deleted イベント - ユーザーが削除されたとき
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      try {
        await prisma.user.delete({
          where: { id: id },
        });

        console.log(`✅ User deleted: ${id}`);
      } catch (error) {
        console.error("Error deleting user from database:", error);
        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }
    }
  }

  return new Response("", { status: 200 });
}
