# PageCraft

Notion → 精美个人主页生成器

## 功能特性

- 🔗 **Notion 集成** - 将 Notion 页面转换为精美网站
- 🎨 **多模板支持** - 多种设计风格可选
- ✨ **统一现代简约界面** - 首页、创建页、升级页、仪表盘共用一致的高级浅色视觉系统
- 🔐 **用户系统** - 基于 Supabase 的用户认证和数据存储
- 💰 **订阅管理** - 免费版/Pro版/团队版订阅
- 📊 **分析统计** - 页面访问量跟踪
- 🚀 **快速部署** - 一键部署到 Vercel

## Notion 输入说明

- 创建站点时支持两种输入方式：直接粘贴 32 位 Notion Page ID，或粘贴完整的 Notion 页面分享链接
- 系统会自动从 Notion URL 中提取页面 ID，兼容带连字符和不带连字符的页面标识
- 在验证失败时，优先检查页面是否已分享给 PageCraft 使用的 Notion integration
- 创建流程会显示验证进度、识别到的页面摘要，以及针对常见输入/权限问题的可执行提示
- 在提交前会即时解析 Notion URL，预览标准化后的 Page ID 和当前模板，尽量减少无效提交
- 升级到 Pro 时也支持直接粘贴完整 Notion URL，系统会在结账前自动规范化页面 ID 与自定义域名
- 页面中的 Notion 文件图片会通过服务端刷新签名 URL，减少过期链接导致的图片失效

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Supabase
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **支付**: Stripe
- **部署**: Vercel

## 最新界面迭代

- 全局视觉变量已统一到 `src/app/globals.css`，包括浅暖底色、细网格背景、玻璃卡片层级和统一文字色阶
- 核心用户路径 `首页 /create /dashboard /domains` 已改为同一套现代简约设计语言，减少默认 SaaS 模板感
- 创建页与升级页保留原有业务逻辑，但重新组织了信息层级，让表单、状态反馈、预览摘要和下一步动作更清晰

## 快速开始

### 系统要求
- Node.js >= 18.17.0 (推荐使用 LTS 版本)
- npm 或 yarn

### 版本检查
项目包含 Node.js 版本检查脚本，在安装依赖时会自动运行：
```bash
# 手动检查 Node.js 版本
npm run check:node

# 或直接运行脚本
node scripts/check-node-version.js
```

如果版本不符合要求，脚本会显示错误信息并指导如何升级。

### 环境变量

复制 `.env.local.example` 到 `.env.local` 并填写：

```bash
# Notion Integration Token
NOTION_TOKEN=your_notion_integration_token_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### 安装依赖

```bash
# 如果你使用 nvm，确保使用正确的 Node.js 版本
nvm use

# 安装依赖
npm install
```

### 开发服务器

```bash
npm run dev
```

### 数据库设置

1. 在 Supabase 控制台创建新项目
2. 运行 SQL 迁移文件：`supabase/migrations/20240313_create_tables.sql`
3. 配置环境变量

## 数据库架构

### 主要表结构

#### `user_profiles` - 用户资料
- `id` (UUID) - 用户ID
- `email` (TEXT) - 邮箱
- `is_pro` (BOOLEAN) - 是否为Pro用户
- `subscription_tier` (TEXT) - 订阅等级 (free/pro/team)
- `stripe_customer_id` (TEXT) - Stripe客户ID

#### `user_pages` - 用户页面
- `id` (UUID) - 页面ID
- `user_id` (UUID) - 用户ID
- `notion_page_id` (TEXT) - Notion页面ID
- `title` (TEXT) - 页面标题
- `custom_domain` (TEXT) - 自定义域名
- `template` (TEXT) - 使用的模板

#### `page_analytics` - 页面分析
- `id` (UUID) - 分析记录ID
- `page_id` (UUID) - 页面ID
- `date` (DATE) - 日期
- `views` (INTEGER) - 访问量
- `unique_visitors` (INTEGER) - 独立访客数

## 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 重要修改需更新测试用例
- 保持 README 文档同步更新

### 测试
```bash
# 运行所有测试
npm test

# 运行UI测试
npm run test:ui
```

本地 Playwright 回归默认会启动 `http://127.0.0.1:3000` 的 Next 开发服务器，并显式绑定 `127.0.0.1` 以兼容受限环境；项目已在 `next.config.mjs` 中允许 `localhost` 和 `127.0.0.1` 作为开发时跨源访问来源。

## 商业模型

### 免费版
- 1个页面
- 基础模板
- 子域名
- 带水印

### Pro版 ($6/月)
- 无限页面
- 所有高级模板
- 自定义域名
- 去水印
- 密码保护
- 分析统计

### 团队版 ($12/月)
- 多成员协作
- 团队模板库
- API访问
- 优先支持

## 路线图

详见 [ROADMAP.md](./ROADMAP.md) 和 [ITERATION.md](./ITERATION.md)
