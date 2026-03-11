import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const DOMAINS_FILE = path.join(DATA_DIR, 'domains.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // 目录已存在
  }
}

// 读取 JSON 文件
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

// 写入 JSON 文件
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 域名配置
export interface DomainConfig {
  domain: string;
  pageId: string;
  template: string;
  userEmail?: string;
  subscriptionId?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 用户
export interface User {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'past_due';
  createdAt: string;
  updatedAt: string;
}

// 域名操作
export const domainsDb = {
  async getAll(): Promise<Record<string, DomainConfig>> {
    return readJsonFile(DOMAINS_FILE, {});
  },
  
  async get(domain: string): Promise<DomainConfig | null> {
    const all = await this.getAll();
    return all[domain] || null;
  },
  
  async set(domain: string, config: DomainConfig): Promise<void> {
    const all = await this.getAll();
    all[domain] = config;
    await writeJsonFile(DOMAINS_FILE, all);
  },
  
  async delete(domain: string): Promise<void> {
    const all = await this.getAll();
    delete all[domain];
    await writeJsonFile(DOMAINS_FILE, all);
  },
};

// 用户操作
export const usersDb = {
  async getAll(): Promise<Record<string, User>> {
    return readJsonFile(USERS_FILE, {});
  },
  
  async get(id: string): Promise<User | null> {
    const all = await this.getAll();
    return all[id] || null;
  },
  
  async getByEmail(email: string): Promise<User | null> {
    const all = await this.getAll();
    return Object.values(all).find(u => u.email === email) || null;
  },
  
  async set(id: string, user: User): Promise<void> {
    const all = await this.getAll();
    all[id] = user;
    await writeJsonFile(USERS_FILE, all);
  },
};
