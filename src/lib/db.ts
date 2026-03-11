// 内存存储（Vercel Serverless 兼容）
// 生产环境应该使用 Redis 或数据库

const domainStore: Record<string, {
  pageId: string;
  template: string;
  userEmail?: string;
  subscriptionId?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}> = {};

const userStore: Record<string, {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'past_due';
  createdAt: string;
  updatedAt: string;
}> = {};

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
    return domainStore;
  },
  
  async get(domain: string): Promise<DomainConfig | null> {
    return domainStore[domain] || null;
  },
  
  async set(domain: string, config: DomainConfig): Promise<void> {
    domainStore[domain] = config;
  },
  
  async delete(domain: string): Promise<void> {
    delete domainStore[domain];
  },
};

// 用户操作
export const usersDb = {
  async getAll(): Promise<Record<string, User>> {
    return userStore;
  },
  
  async get(id: string): Promise<User | null> {
    return userStore[id] || null;
  },
  
  async getByEmail(email: string): Promise<User | null> {
    return Object.values(userStore).find(u => u.email === email) || null;
  },
  
  async set(id: string, user: User): Promise<void> {
    userStore[id] = user;
  },
};
