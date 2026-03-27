-- PageCraft 持久化认证与域名/session 补充迁移

-- 扩展 user_profiles 以兼容当前自定义认证字段
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_salt TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due'));

-- 为当前页面发布链路补充 slug
ALTER TABLE user_pages
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE INDEX IF NOT EXISTS idx_user_pages_slug ON user_pages(slug);

-- 自定义域名表
CREATE TABLE IF NOT EXISTS domains (
  domain TEXT PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES user_pages(id) ON DELETE CASCADE,
  template TEXT DEFAULT 'minimal',
  user_email TEXT,
  subscription_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_user_email ON domains(user_email);

DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Domains are readable by service role" ON domains
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Domains are writable by service role" ON domains
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 持久化 session 表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are readable by service role" ON sessions
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Sessions are writable by service role" ON sessions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
