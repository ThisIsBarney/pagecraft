# Custom Domain Implementation Plan

## 技术方案
使用 Vercel 的 Edge Config + Middleware 实现自定义域名

## 数据模型
```
DomainConfig: {
  domain: "example.com",
  pageId: "notion-page-id",
  template: "minimal",
  owner: "user-id",
  verified: boolean,
  createdAt: timestamp
}
```

## 实现步骤
1. 域名配置存储 (Vercel KV)
2. Middleware 域名路由
3. 域名验证 (DNS CNAME)
4. 用户管理界面

## 免费 vs Pro
- 免费: 子域名 (user.pagecraft.io)
- Pro ($6/月): 自定义域名
