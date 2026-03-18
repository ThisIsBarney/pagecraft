#!/usr/bin/env node

/**
 * Node.js 版本检查脚本
 * 确保系统满足项目的最低 Node.js 版本要求
 */

const fs = require('fs');
const path = require('path');

// 从 package.json 读取 engines 配置
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 获取要求的 Node.js 版本
const requiredVersion = packageJson.engines?.node || '>=18.17.0';
const currentVersion = process.version;

// 解析版本要求
function checkVersion(current, required) {
  // 简单的版本检查逻辑
  const currentNum = parseFloat(current.replace('v', ''));
  const match = required.match(/>=(\d+\.\d+\.\d+)/);
  
  if (match) {
    const requiredNum = parseFloat(match[1]);
    return currentNum >= requiredNum;
  }
  
  // 如果无法解析，默认通过
  return true;
}

// 执行检查
const isValid = checkVersion(currentVersion, requiredVersion);

if (!isValid) {
  console.error(`❌ Node.js 版本不满足要求`);
  console.error(`   当前版本: ${currentVersion}`);
  console.error(`   要求版本: ${requiredVersion}`);
  console.error(`\n请升级 Node.js:`);
  console.error(`   1. 使用 nvm: nvm install 18.17.0 && nvm use 18.17.0`);
  console.error(`   2. 或使用 Homebrew: brew upgrade node`);
  console.error(`\n项目要求详见 package.json 中的 "engines" 字段`);
  process.exit(1);
} else {
  console.log(`✅ Node.js 版本检查通过: ${currentVersion} (要求: ${requiredVersion})`);
  process.exit(0);
}