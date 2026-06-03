-- 1. 创建 reports 表
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    packet_loss NUMERIC(10,2) NOT NULL,
    latency NUMERIC(10,2) NOT NULL,
    throughput NUMERIC(10,2) NOT NULL,
    experiment_description TEXT,
    generated_observation TEXT,
    generated_analysis TEXT,
    generated_conclusion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 启用行级安全（Row Level Security, RLS）
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略：仅允许用户管理和访问属于自己的数据
-- 3.1 允许查询 (SELECT) 自已的报告
CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3.2 允许插入 (INSERT) 新报告（且 user_id 必须等于当前登录用户的 uid）
CREATE POLICY "Users can create their own reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3.3 允许更新 (UPDATE) 自己的报告
CREATE POLICY "Users can update their own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3.4 允许删除 (DELETE) 自己的报告
CREATE POLICY "Users can delete their own reports" 
ON public.reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. 创建索引提高按用户查询的速度
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);
