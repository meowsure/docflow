import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, telegram_id, username, first_name, last_name } = await req.json();
    console.log('Received request:', { action, token, telegram_id, username });

    if (action === 'generate_token') {
      // Generate a unique token for bot authorization
      const authToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      
      // Store the token temporarily
      const { error: insertError } = await supabase
        .from('auth_tokens')
        .insert({
          token: authToken,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (insertError) {
        console.error('Error storing auth token:', insertError);
        throw insertError;
      }

      return new Response(JSON.stringify({ 
        token: authToken,
        expires_at: expiresAt.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_token') {
      if (!token || !telegram_id) {
        throw new Error('Token and telegram_id are required');
      }

      // Check if token exists and is valid
      const { data: tokenData, error: tokenError } = await supabase
        .from('auth_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired token');
      }

      // Mark token as used
      await supabase
        .from('auth_tokens')
        .update({ used: true })
        .eq('token', token);

      // Check if user exists
      let { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user:', userError);
        throw userError;
      }

      let user = existingUser;

      if (!existingUser) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            telegram_id: telegram_id,
            username: username || null,
            first_name: first_name || null,
            last_name: last_name || null,
            full_name: `${first_name || ''} ${last_name || ''}`.trim() || username || `User ${telegram_id}`
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        user = newUser;
      } else {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            username: username || existingUser.username,
            first_name: first_name || existingUser.first_name,
            last_name: last_name || existingUser.last_name,
            full_name: `${first_name || existingUser.first_name || ''} ${last_name || existingUser.last_name || ''}`.trim() || username || existingUser.username || `User ${telegram_id}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          throw updateError;
        }

        user = updatedUser;
      }

      // Create JWT token
      const jwtToken = await createJWT(user, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

      console.log('Bot auth successful for user:', user.telegram_id);

      return new Response(JSON.stringify({
        user: user,
        access_token: jwtToken
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in telegram-bot-auth function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// JWT creation function
async function createJWT(user: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'authenticated',
    exp: now + (60 * 60 * 24), // 24 hours
    iat: now,
    iss: 'supabase',
    sub: user.id,
    email: '',
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
    telegram_id: user.telegram_id
  };

  const encoder = new TextEncoder();
  
  // Create signature
  const headerB64 = btoa(JSON.stringify(header)).replace(/[+\/=]/g, (m) => ({'+':'-', '/':'_', '=':''}[m]!));
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/[+\/=]/g, (m) => ({'+':'-', '/':'_', '=':''}[m]!));
  
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/[+\/=]/g, (m) => ({'+':'-', '/':'_', '=':''}[m]!));
  
  return `${data}.${signatureB64}`;
}