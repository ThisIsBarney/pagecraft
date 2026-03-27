import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

// 内存存储回退层
// 未配置 Supabase service role 时，本地开发仍可运行。

const domainStore: Record<string, DomainConfig> = {};
const userStore: Record<string, User> = {};
const userPagesStore: Record<string, UserPage> = {};
const sessionStore: Record<string, SessionRecord> = {};

export interface DomainConfig {
  pageId: string;
  template: string;
  userEmail?: string;
  subscriptionId?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  passwordSalt?: string;
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: string;
  stripeCustomerId?: string;
  subscriptionStatus: "free" | "active" | "cancelled" | "past_due";
  createdAt: string;
  updatedAt: string;
}

export interface UserPage {
  id: string;
  userId: string;
  notionPageId: string;
  title: string;
  slug: string;
  template: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  password_salt: string | null;
  email_verified: boolean | null;
  email_verification_token_hash: string | null;
  email_verification_expires_at: string | null;
  password_reset_token_hash: string | null;
  password_reset_expires_at: string | null;
  stripe_customer_id: string | null;
  subscription_status: User["subscriptionStatus"] | null;
  created_at: string;
  updated_at: string;
};

type UserPageRow = {
  id: string;
  user_id: string;
  notion_page_id: string;
  title: string;
  slug: string | null;
  template: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
};

type DomainRow = {
  domain: string;
  page_id: string;
  template: string | null;
  user_email: string | null;
  subscription_id: string | null;
  verified: boolean | null;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

function assertSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return supabaseAdmin;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name || undefined,
    passwordHash: row.password_hash || undefined,
    passwordSalt: row.password_salt || undefined,
    emailVerified: row.email_verified ?? true,
    emailVerificationTokenHash: row.email_verification_token_hash || undefined,
    emailVerificationExpiresAt: row.email_verification_expires_at || undefined,
    passwordResetTokenHash: row.password_reset_token_hash || undefined,
    passwordResetExpiresAt: row.password_reset_expires_at || undefined,
    stripeCustomerId: row.stripe_customer_id || undefined,
    subscriptionStatus: row.subscription_status || "free",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toUserRow(user: User): UserRow {
  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    password_hash: user.passwordHash || null,
    password_salt: user.passwordSalt || null,
    email_verified: user.emailVerified ?? true,
    email_verification_token_hash: user.emailVerificationTokenHash || null,
    email_verification_expires_at: user.emailVerificationExpiresAt || null,
    password_reset_token_hash: user.passwordResetTokenHash || null,
    password_reset_expires_at: user.passwordResetExpiresAt || null,
    stripe_customer_id: user.stripeCustomerId || null,
    subscription_status: user.subscriptionStatus,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

function toUserPage(row: UserPageRow): UserPage {
  return {
    id: row.id,
    userId: row.user_id,
    notionPageId: row.notion_page_id,
    title: row.title,
    slug: row.slug || row.notion_page_id,
    template: row.template || "minimal",
    settings: row.settings || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastAccessedAt: row.last_accessed_at,
  };
}

function toUserPageRow(page: UserPage): UserPageRow {
  return {
    id: page.id,
    user_id: page.userId,
    notion_page_id: page.notionPageId,
    title: page.title,
    slug: page.slug,
    template: page.template,
    settings: page.settings,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
    last_accessed_at: page.lastAccessedAt,
  };
}

function toDomainConfig(row: DomainRow): DomainConfig {
  return {
    pageId: row.page_id,
    template: row.template || "minimal",
    userEmail: row.user_email || undefined,
    subscriptionId: row.subscription_id || undefined,
    verified: Boolean(row.verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDomainRow(domain: string, config: DomainConfig): DomainRow {
  return {
    domain,
    page_id: config.pageId,
    template: config.template,
    user_email: config.userEmail || null,
    subscription_id: config.subscriptionId || null,
    verified: config.verified,
    created_at: config.createdAt,
    updated_at: config.updatedAt,
  };
}

function toSession(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function toSessionRow(session: SessionRecord): SessionRow {
  return {
    id: session.id,
    user_id: session.userId,
    created_at: session.createdAt,
    expires_at: session.expiresAt,
  };
}

export const domainsDb = {
  async getAll(): Promise<Record<string, DomainConfig>> {
    if (!isSupabaseAdminConfigured) {
      return domainStore;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db.from("domains").select("*");
    if (error) {
      throw new Error(`Failed to load domains: ${error.message}`);
    }

    return (data || []).reduce<Record<string, DomainConfig>>((acc, row) => {
      const domainRow = row as DomainRow;
      acc[domainRow.domain] = toDomainConfig(domainRow);
      return acc;
    }, {});
  },

  async get(domain: string): Promise<DomainConfig | null> {
    if (!isSupabaseAdminConfigured) {
      return domainStore[domain] || null;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("domains")
      .select("*")
      .eq("domain", domain)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load domain: ${error.message}`);
    }

    return data ? toDomainConfig(data as DomainRow) : null;
  },

  async set(domain: string, config: DomainConfig): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      domainStore[domain] = config;
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("domains").upsert(toDomainRow(domain, config));
    if (error) {
      throw new Error(`Failed to save domain: ${error.message}`);
    }
  },

  async delete(domain: string): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      delete domainStore[domain];
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("domains").delete().eq("domain", domain);
    if (error) {
      throw new Error(`Failed to delete domain: ${error.message}`);
    }
  },
};

export const usersDb = {
  async getAll(): Promise<Record<string, User>> {
    if (!isSupabaseAdminConfigured) {
      return userStore;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db.from("user_profiles").select("*");
    if (error) {
      throw new Error(`Failed to load users: ${error.message}`);
    }

    return (data || []).reduce<Record<string, User>>((acc, row) => {
      const user = toUser(row as UserRow);
      acc[user.id] = user;
      return acc;
    }, {});
  },

  async get(id: string): Promise<User | null> {
    if (!isSupabaseAdminConfigured) {
      return userStore[id] || null;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load user: ${error.message}`);
    }

    return data ? toUser(data as UserRow) : null;
  },

  async getByEmail(email: string): Promise<User | null> {
    if (!isSupabaseAdminConfigured) {
      return Object.values(userStore).find((user) => user.email === email) || null;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load user by email: ${error.message}`);
    }

    return data ? toUser(data as UserRow) : null;
  },

  async set(id: string, user: User): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      userStore[id] = user;
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("user_profiles").upsert(toUserRow(user));
    if (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  },
};

export const userPagesDb = {
  async getAll(): Promise<Record<string, UserPage>> {
    if (!isSupabaseAdminConfigured) {
      return userPagesStore;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db.from("user_pages").select("*");
    if (error) {
      throw new Error(`Failed to load pages: ${error.message}`);
    }

    return (data || []).reduce<Record<string, UserPage>>((acc, row) => {
      const page = toUserPage(row as UserPageRow);
      acc[page.id] = page;
      return acc;
    }, {});
  },

  async get(id: string): Promise<UserPage | null> {
    if (!isSupabaseAdminConfigured) {
      return userPagesStore[id] || null;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("user_pages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load page: ${error.message}`);
    }

    return data ? toUserPage(data as UserPageRow) : null;
  },

  async getByUserId(userId: string): Promise<UserPage[]> {
    if (!isSupabaseAdminConfigured) {
      return Object.values(userPagesStore).filter((page) => page.userId === userId);
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("user_pages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to load user pages: ${error.message}`);
    }

    return (data || []).map((row) => toUserPage(row as UserPageRow));
  },

  async getByNotionPageId(notionPageId: string): Promise<UserPage | null> {
    if (!isSupabaseAdminConfigured) {
      return (
        Object.values(userPagesStore).find((page) => page.notionPageId === notionPageId) || null
      );
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("user_pages")
      .select("*")
      .eq("notion_page_id", notionPageId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load page by Notion ID: ${error.message}`);
    }

    return data ? toUserPage(data as UserPageRow) : null;
  },

  async set(id: string, page: UserPage): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      userPagesStore[id] = page;
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("user_pages").upsert(toUserPageRow(page));
    if (error) {
      throw new Error(`Failed to save page: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      delete userPagesStore[id];
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("user_pages").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  },
};

export const sessionsDb = {
  async get(id: string): Promise<SessionRecord | null> {
    if (!isSupabaseAdminConfigured) {
      return sessionStore[id] || null;
    }

    const db = assertSupabaseAdmin();
    const { data, error } = await db
      .from("sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load session: ${error.message}`);
    }

    return data ? toSession(data as SessionRow) : null;
  },

  async set(id: string, session: SessionRecord): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      sessionStore[id] = session;
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("sessions").upsert(toSessionRow(session));
    if (error) {
      throw new Error(`Failed to save session: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseAdminConfigured) {
      delete sessionStore[id];
      return;
    }

    const db = assertSupabaseAdmin();
    const { error } = await db.from("sessions").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  },
};
