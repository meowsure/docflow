// supabase/functions/telegram-auth/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as crypto from "https://deno.land/std@0.177.0/node/crypto.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabase = createClient(
  Deno.env.get("VITE_SUPABASE_URL")!,
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!
);

serve(async (req) => {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: "initData is missing" }), {
        status: 400,
      });
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return new Response(JSON.stringify({ error: "hash is missing" }), {
        status: 400,
      });
    }

    // Формируем строку для проверки подписи
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      if (key !== "hash") {
        dataCheckArr.push(`${key}=${value}`);
      }
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");

    // Вычисляем хеш
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(Deno.env.get("BOT_TOKEN")!)
      .digest();

    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) {
      return new Response(JSON.stringify({ error: "Invalid hash" }), {
        status: 403,
      });
    }

    // Достаём user
    const userJson = params.get("user");
    if (!userJson) {
      return new Response(JSON.stringify({ error: "user field missing" }), {
        status: 400,
      });
    }
    const tgUser = JSON.parse(userJson);

    // Создаём или обновляем пользователя в Supabase
    const { data: user, error } = await supabase
      .from("users")
      .upsert({
        telegram_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
