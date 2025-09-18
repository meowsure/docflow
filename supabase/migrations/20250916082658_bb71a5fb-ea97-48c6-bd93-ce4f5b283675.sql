-- Создание таблицы пользователей
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы задач
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('send_docs', 'make_scan', 'shipment')),
  description TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_progress', 'completed', 'cancelled')),
  
  -- Поля для отгрузки
  address TEXT,
  schedule TEXT,
  request_code TEXT,
  loading_contacts TEXT,
  shop_name TEXT,
  goods_name TEXT,
  goods_volume TEXT,
  goods_weight TEXT,
  goods_package TEXT,
  contract_number TEXT,
  loading_date TEXT,
  loading_requirements TEXT,
  additional_info TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы файлов
CREATE TABLE public.task_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- Политики для users (пользователи могут видеть только свои данные)
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

-- Политики для tasks (пользователи могут видеть только свои задачи)
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can create own tasks" ON public.tasks
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- Политики для task_files (пользователи могут видеть файлы только своих задач)
CREATE POLICY "Users can view files of own tasks" ON public.task_files
  FOR SELECT USING (task_id IN (
    SELECT t.id FROM public.tasks t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can create files for own tasks" ON public.task_files
  FOR INSERT WITH CHECK (task_id IN (
    SELECT t.id FROM public.tasks t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can delete files of own tasks" ON public.task_files
  FOR DELETE USING (task_id IN (
    SELECT t.id FROM public.tasks t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();