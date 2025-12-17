// 替换引入：使用@supabase/ssr的createBrowserClient（浏览器环境专用）
import { createBrowserClient } from '@supabase/ssr';
// 保留类型定义

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 初始化客户端：使用createBrowserClient，自动处理浏览器Cookie（包括auth-token和refresh-token）
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export interface article {
  id: number
  title: string
  content: string
  delta_data: string
  excerpt?: string
  cover_img?:string
  published: boolean
  sort:number
  user_id: string
  created_at: string
  updated_at: string
  labels?: article_groups[]
  article_groups_relation?: article_groups_relation[]
  articles_content?: articles_content
}

export interface articles_content {
  id: number
  content_id: number
  content?: string
  delta_data?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  user_id: string
  user_token: string
  username: string
  email: string
  password: string
  created_at: string
  updated_at: string
}

export interface Blogger {
  id: number
  user_id: number
  domain: string
  avatar_url?: string
  user_name?: string
  introduce1?: string
  introduce2?: string
  motto1?: string
  motto2?: string
  created_at: string
  updated_at: string
}


// export interface Comment {
//   id: string
//   post_id: string
//   user_id: string
//   content: string
//   created_at: string
//   profiles?: {
//     username: string
//     full_name: string
//     avatar_url?: string
//   }
// }

export interface article_groups_relation {
  group_id: number,
  article_id:number,
  article_groups?: article_groups
}

export interface life_styles {
  id: number
  title: string
  excerpt?: string
  cover_img?: string
  published: boolean
  sort:number
  user_id: string
  created_at: string
  updated_at: string
  photos?: life_styles_photos[]
  labelIds?: (life_styles_label|life_styles_sub_label)[]
}

export interface life_styles_photos {
  id: number
  life_styles_id:number
  url: string
  excerpt?: string
  sort:number
  user_id: string
  created_at: string
}

export interface life_styles_label {
  id: number
  name: string
  sort:number
}

export interface life_styles_sub_label {
  id: number
  name: string
  sort:number
}

export interface life_styles_label_relation { 
  label_id:number,
  sub_label_id:number,
}

export interface article_groups {
  id: number
  name: string
  description?:string,
  userId:string  
}
