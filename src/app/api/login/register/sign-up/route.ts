// import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import crypto from 'crypto';
const TOKEN_SECRET = process.env.TOKEN_SECRET || "";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (value === null) {
                cookieStore.delete({ name, ...options });
              } else {
                cookieStore.set({ name, value, ...options });
              }
            });
          },
        },
        cookieEncoding: 'base64url', // 推荐使用默认的 base64url 编码
      }
    );

    const {
      email,
      password,
      username,
    } = await req.json();

    // 检测users表是否已存在该email
    const { data: userInfoArr , error: userInfoError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);
    if (userInfoError) {
      return NextResponse.json({ msg: userInfoError.code,userInfoError }, { status: 500 });
    }
    if(userInfoArr?.[0]){
      return NextResponse.json({ msg: '该邮箱已注册，可立即登录',code:'email_exists' }, { status: 500 });
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if(error){
      return NextResponse.json({ msg: error.code,error }, { status: 500 });
    }
    // supabase.signUp 注册成功

    // 开始插入users表
    let insertParams = {
      email,
      password,
      user_id:data?.user?.id || "",
      user_token:generateUserToken(data?.user?.id || ""),
      user_name:username,
    }
    const { error: userError } = await supabase
    .from('users')
    .insert(insertParams)
    if(userError){
      return NextResponse.json({ error: userError,msg:'sign-up user error' }, { status: 500 });
    }
    // 插表成功
    return NextResponse.json({ data,msg:'sign-up success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ msg:'sign-up Error',error }, { status: 500 });
  }
}

/**
 * UUID转加密token
 * @param {string} userId - 原user_id（UUID）
 * @returns {string} 加密后的token
 */
function generateUserToken(userId: string) {
  // 步骤1：HMAC-SHA256加密UUID
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  const hash = hmac.update(userId).digest('base64url'); // Base64 URL安全编码（避免/+等特殊字符）
  
  // 可选：拼接UUID前缀（方便后端快速定位user_id，不暴露核心）
  // 格式：[UUID前8位].[加密哈希]，既方便排查又不暴露完整UUID
  const uuidPrefix = userId.substring(0, 8);
  return `${uuidPrefix}.${hash}`;
}