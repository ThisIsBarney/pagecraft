#!/bin/bash

echo "=== PageCraft 权限控制测试 ==="
echo ""

# 测试 1: Free 用户访问域名管理
echo "测试 1: Free 用户访问 /manage-domains"
curl -s -I "https://pagecraft-eight.vercel.app/manage-domains" | grep -i "location\|status"
echo ""

# 测试 2: 未登录用户访问 Dashboard
echo "测试 2: 未登录用户访问 /dashboard"
curl -s -I "https://pagecraft-eight.vercel.app/dashboard" | grep -i "location\|status"
echo ""

# 测试 3: Free 用户访问升级页面
echo "测试 3: Free 用户访问 /domains"
curl -s -I "https://pagecraft-eight.vercel.app/domains" | grep -i "location\|status"
echo ""

# 测试 4: 创建网站页面（应该可以访问）
echo "测试 4: 未登录用户访问 /create"
curl -s -I "https://pagecraft-eight.vercel.app/create" | grep -i "location\|status"
echo ""

# 测试 5: 模板示例页面（应该可以访问）
echo "测试 5: 未登录用户访问 /examples"
curl -s -I "https://pagecraft-eight.vercel.app/examples" | grep -i "location\|status"
echo ""

echo "=== 测试完成 ==="