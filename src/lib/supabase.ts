import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ptcnwrezcrjrgdeftcfm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qCpLOoAeKlCu4fnT4piwsA_DArybjFi'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户相关类型定义
export interface UserProfile {
  id: string
  email: string
  created_at: string
  updated_at: string
  is_pro: boolean
  pro_expires_at?: string
  subscription_tier?: 'free' | 'pro' | 'team'
  stripe_customer_id?: string
}

export interface UserPage {
  id: string
  user_id: string
  notion_page_id: string
  title: string
  custom_domain?: string
  template: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  last_accessed_at: string
}

export interface PageAnalytics {
  id: string
  page_id: string
  date: string
  views: number
  unique_visitors: number
}

// 用户操作
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

export async function createUserProfile(userId: string, email: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      is_pro: false,
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

// 页面操作
export async function getUserPages(userId: string): Promise<UserPage[]> {
  const { data, error } = await supabase
    .from('user_pages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user pages:', error)
    return []
  }

  return data || []
}

export async function createUserPage(
  userId: string,
  notionPageId: string,
  title: string,
  template: string = 'default'
) {
  const { data, error } = await supabase
    .from('user_pages')
    .insert({
      user_id: userId,
      notion_page_id: notionPageId,
      title,
      template,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user page:', error)
    return null
  }

  return data
}

export async function updateUserPage(pageId: string, updates: Partial<UserPage>) {
  const { data, error } = await supabase
    .from('user_pages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', pageId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user page:', error)
    return null
  }

  return data
}

// 分析操作
export async function recordPageView(pageId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  // 尝试更新现有记录
  const { data: existing, error: fetchError } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('page_id', pageId)
    .eq('date', today)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching analytics:', fetchError)
    return
  }

  if (existing) {
    // 更新现有记录
    const { error } = await supabase
      .from('page_analytics')
      .update({
        views: existing.views + 1,
        unique_visitors: existing.unique_visitors // 需要更复杂的唯一访客跟踪
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating analytics:', error)
    }
  } else {
    // 创建新记录
    const { error } = await supabase
      .from('page_analytics')
      .insert({
        page_id: pageId,
        date: today,
        views: 1,
        unique_visitors: 1
      })

    if (error) {
      console.error('Error creating analytics:', error)
    }
  }
}