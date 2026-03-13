-- PageCraft Supabase 数据库迁移
-- 创建时间: 2024-03-13

-- 用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMP WITH TIME ZONE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT UNIQUE,
  
  -- 索引
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 用户页面表
CREATE TABLE IF NOT EXISTS user_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notion_page_id TEXT NOT NULL,
  title TEXT NOT NULL,
  custom_domain TEXT UNIQUE,
  template TEXT DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  UNIQUE(user_id, notion_page_id)
);

-- 页面分析表
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES user_pages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- 索引
  UNIQUE(page_id, date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_pro ON user_profiles(is_pro);

CREATE INDEX IF NOT EXISTS idx_user_pages_user_id ON user_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pages_notion_page_id ON user_pages(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_user_pages_custom_domain ON user_pages(custom_domain);

CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_date ON page_analytics(date);

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 user_profiles 表添加触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 user_pages 表添加触发器
DROP TRIGGER IF EXISTS update_user_pages_updated_at ON user_pages;
CREATE TRIGGER update_user_pages_updated_at
  BEFORE UPDATE ON user_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全 (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

-- 创建策略
-- user_profiles: 用户只能访问自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_pages: 用户只能访问自己的页面
CREATE POLICY "Users can view own pages" ON user_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON user_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON user_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON user_pages
  FOR DELETE USING (auth.uid() = user_id);

-- page_analytics: 页面分析数据公开可读（用于展示访问统计）
CREATE POLICY "Analytics are publicly readable" ON page_analytics
  FOR SELECT USING (true);

-- 注释
COMMENT ON TABLE user_profiles IS 'PageCraft 用户资料表';
COMMENT ON TABLE user_pages IS '用户创建的页面表';
COMMENT ON TABLE page_analytics IS '页面访问分析表';