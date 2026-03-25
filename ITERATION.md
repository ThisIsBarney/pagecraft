# PageCraft 迭代计划

## 当前状态
✅ MVP 完成：基础页面渲染、部署上线
✅ Supabase 集成：用户数据持久化基础已搭建

## 迭代阶段

### Phase 1: 稳定性 & 体验（现在做）
- [ ] 图片支持（Notion 图片签名 URL 处理）
- [x] 更好的错误处理（具体错误提示）
- [x] 加载状态/骨架屏
- [x] 页面标题/SEO 优化
- [ ] 更多块类型支持（todo、callout、quote）

### Phase 2: 功能扩展
- [ ] 数据库渲染（表格/卡片视图）
- [ ] 子页面/嵌套内容支持
- [ ] 多模板选择（极简、设计师、开发者）
- [ ] 自定义域名支持

### Phase 3: 商业化
- [x] **用户系统基础** - Supabase 集成完成
  - [ ] 用户认证界面
  - [ ] 用户仪表盘
  - [ ] 页面管理功能
- [ ] 付费墙（高级模板、自定义域名）
- [ ] 分析统计（访问量）

## 当前进行：Phase 1 + Phase 3 用户系统基础

## 最近完成
1. 页面标题与描述元数据已补齐到关键转化路径：首页、创建页、模板示例、仪表盘、升级页、支付结果页。
2. `use client` 页面已拆分为服务端 wrapper + 客户端组件，确保 Next.js metadata 可以稳定生效。
3. Playwright 默认基址已修正为本地测试服务器，避免关键页面测试误连线上环境。
4. 创建页现在会显示验证进度、已识别内容摘要，并对 Notion 权限/输入错误给出可执行提示。
5. 升级页会在结账前标准化自定义域名和 Notion URL，并在前端拦截明显无效的输入。
6. 创建页会在提交前即时解析并预览 Notion Page ID；Playwright 本地回归显式绑定 `127.0.0.1`，兼容受限执行环境。
7. 公共页面中的 Notion 文件图片现在通过服务端按 block ID 刷新签名 URL，降低图片链接过期后的渲染失败概率。
8. Notion 高频块渲染已扩展到 `toggle/table/synced block/bookmark/video/file/pdf`，并统一未知块 fallback 为可识别提示。
9. 新增 `tests/block-renderer-regression.spec.ts`，基于 `/examples` 页面验证高级块渲染与 fallback 行为，避免回归。

## Supabase 集成完成项
✅ 安装 @supabase/supabase-js 依赖
✅ 创建 Supabase 客户端配置 (src/lib/supabase.ts)
✅ 设计数据库表结构 (supabase/migrations/)
✅ 更新环境变量配置
✅ 更新 README 文档
✅ 创建基础测试用例

## 下一步用户系统任务
1. **用户认证界面** - 登录/注册页面
2. **用户仪表盘** - 管理已保存的页面
3. **页面保存功能** - 将 Notion 页面保存到用户账户
4. **订阅状态集成** - 连接 Stripe 和用户资料

## 数据库表结构
- `user_profiles` - 用户资料（订阅状态等）
- `user_pages` - 用户保存的页面
- `page_analytics` - 页面访问统计
