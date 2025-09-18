-- Create auth_tokens table for temporary bot authorization tokens
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient token lookup
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON public.auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON public.auth_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed as this table is only accessed by edge functions