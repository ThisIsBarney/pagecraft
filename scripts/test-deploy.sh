#!/bin/bash

# 自动部署测试脚本
# 用法: ./scripts/test-deploy.sh [部署URL]

set -e

URL=${1:-"https://pagecraft-eight.vercel.app"}

echo "🧪 Testing deployment: $URL"
echo ""

# 测试首页
echo "1. Testing homepage..."
if curl -s "$URL" | grep -q "PageCraft"; then
    echo "   ✅ Homepage OK"
else
    echo "   ❌ Homepage FAILED"
    exit 1
fi

# 测试创建页面
echo "2. Testing /create..."
if curl -s "$URL/create" | grep -q "Create your site"; then
    echo "   ✅ Create page OK"
else
    echo "   ❌ Create page FAILED"
    exit 1
fi

# 测试示例页面
echo "3. Testing /examples..."
if curl -s "$URL/examples" | grep -q "Template Gallery"; then
    echo "   ✅ Examples page OK"
else
    echo "   ❌ Examples page FAILED"
    exit 1
fi

# 测试 dashboard
echo "4. Testing /dashboard..."
if curl -s "$URL/dashboard" | grep -q "Dashboard\|Welcome"; then
    echo "   ✅ Dashboard OK"
else
    echo "   ❌ Dashboard FAILED"
    exit 1
fi

# 测试域名页面
echo "5. Testing /domains..."
if curl -s "$URL/domains" | grep -q "Upgrade to Pro\|Custom Domain"; then
    echo "   ✅ Domains page OK"
else
    echo "   ❌ Domains page FAILED"
    exit 1
fi

# 测试 API
echo "6. Testing API..."
API_RESPONSE=$(curl -s "$URL/api/debug?pageId=test" || echo "error")
if echo "$API_RESPONSE" | grep -q "notionTokenSet"; then
    echo "   ✅ Debug API OK"
else
    echo "   ⚠️  Debug API response: $API_RESPONSE"
fi

echo ""
echo "✅ All tests passed!"
