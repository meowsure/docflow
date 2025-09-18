import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { initData } = await req.json();
    
    // Валидация Telegram Web App initData
    const isValid = await validateTelegramWebAppData(initData, telegramBotToken);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid Telegram data' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Парсинг данных пользователя
    const urlParams = new URLSearchParams(initData);
    const userDataString = urlParams.get('user');
    
    if (!userDataString) {
      return new Response(
        JSON.stringify({ error: 'No user data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userData = JSON.parse(userDataString);
    
    // Создаем или обновляем пользователя
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userData.id)
      .single();

    let user;
    if (existingUser) {
      // Обновляем существующего пользователя
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          username: userData.username || null,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        })
        .eq('telegram_id', userData.id)
        .select()
        .single();
      
      if (error) throw error;
      user = updatedUser;
    } else {
      // Создаем нового пользователя
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: userData.id,
          username: userData.username || null,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        })
        .select()
        .single();
      
      if (error) throw error;
      user = newUser;
    }

    // Создаем JWT токен
    const jwt = await createJWT(user, supabaseKey);

    return new Response(
      JSON.stringify({ 
        user,
        access_token: jwt,
        token_type: 'bearer'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in telegram-auth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function validateTelegramWebAppData(initData: string, botToken: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = new URLSearchParams(initData);
  const hash = data.get('hash');
  data.delete('hash');
  
  // Сортируем параметры
  const sortedParams = Array.from(data.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Создаем HMAC ключ из токена бота
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const botTokenKey = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));
  
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    botTokenKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Создаем подпись
  const signature = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(sortedParams));
  const computedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHash === hash;
}

async function createJWT(user: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase',
    sub: user.id,
    email: `${user.telegram_id}@telegram.local`,
    phone: '',
    app_metadata: {
      provider: 'telegram',
      providers: ['telegram']
    },
    user_metadata: {
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name
    },
    role: 'authenticated',
    aal: 'aal1',
    amr: [{ method: 'telegram', timestamp: Math.floor(Date.now() / 1000) }],
    session_id: crypto.randomUUID(),
    telegram_id: user.telegram_id
  };

  const encoder = new TextEncoder();
  
  // Кодируем header и payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = encodedHeader + '.' + encodedPayload;
  
  // Создаем подпись
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return data + '.' + encodedSignature;
}