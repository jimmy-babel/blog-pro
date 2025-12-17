import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // { cookies: { get: (name) => cookieStore.get(name)?.value } }
      {
        // cookies: {
        //   // 读取Cookie：严格返回string或undefined
        //   // get: (name: string) => {
        //   //   const cookie = cookieStore.get(name);
        //   //   return cookie ? cookie.value : undefined;
        //   // },
        //   // // 设置Cookie：严格接收name、value、options
        //   // set: (name: string, value: string, options: CookieOptions) => {
        //   //   cookieStore.set({ name, value, ...options });
        //   // },
        //   // // 删除Cookie：严格接收name和options
        //   // remove: (name: string, options: CookieOptions) => {
        //   //   cookieStore.delete({ name, ...options });
        //   // },
          
        //   getAll: cookieStore.getAll, // 获取所有 Cookie
        //   // setAll: cookieStore.setAll, // 设置多个 Cookie（支持批量操作）
        // },
        // cookieEncoding: 'raw', // 显式指定编码方式（推荐raw，避免默认base64url的潜在问题）

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
    // 获取查询参数中的 blogger
    const url = new URL(req.url); //GET请求获取URL
    const blogger = url.searchParams.get('blogger'); // GET获取查询参数中的blogger



    const { data, error: supabaseError } = await supabase.auth.getUser(); //通过cookie获取当前登录的用户信息
    console.log('getUser 返回数据:', data, '错误:', supabaseError);
    // console.log('Cookies:', cookieStore.getAll()); // 打印所有 cookies 以便调试
    // if(supabaseError){
    //   return NextResponse.json({ msg: 'supabase.auth.getUser出错',error:supabaseError }, { status: 500 });
    // }
    let user = data?.user;
    if (user) {
      // 获取用户配置信息
      const { data: userInfoArr , error } = await supabase
        .from('users')
        .select('id, user_name, email, user_token,bloggerInfo:bloggers(id,user_id,domain,avatar_url)')
        .eq('user_id', user.id)
        .eq('bloggers.domain', blogger)
        .limit(1);
      const userInfo = userInfoArr?.[0];
      let bloggerInfo = userInfo?.bloggerInfo?.[0] || {} as {id:string,user_id:string,domain:string,avatar_url:string};
      if (error) {
        return NextResponse.json({ msg: '获取用户信息出错', error }, { status: 500 });
      }
      if(!userInfo){
        return NextResponse.json({ msg: '用户信息不存在', error }, { status: 500 });
      }
      return NextResponse.json({ data: { isLogin: true, isBlogger:!!(blogger == bloggerInfo?.domain),userInfo,bloggerInfo } }, { status: 200 });
    } else {
      console.log('getUser 没有登录');
      return NextResponse.json({ data: { isLogin: false }, error:supabaseError }, { status: 200 });
    }
  } catch (error) {
    console.error('服务器内部错误:', error);
    return NextResponse.json({ msg: '服务器内部错误',error }, { status: 500 });
  }
}


/**
 * UUID转加密token
 * @param {string} userId - 原user_id（UUID）
 * @returns {string} 加密后的token
 */
function generateUserToken(userId: string) {
  const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
  // 步骤1：HMAC-SHA256加密UUID
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  const hash = hmac.update(userId).digest('base64url'); // Base64 URL安全编码（避免/+等特殊字符）
  
  // 可选：拼接UUID前缀（方便后端快速定位user_id，不暴露核心）
  // 格式：[UUID前8位].[加密哈希]，既方便排查又不暴露完整UUID
  const uuidPrefix = userId.substring(0, 8);
  return `${uuidPrefix}.${hash}`;
}