import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const ServerClientSupabase = createServerClient(
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
      blogger
    } = await req.json();
    const { data,error } = await ServerClientSupabase.auth.signInWithPassword({
      email,
      password,
    })
    if(error){
      let msg = error.code;
      if(error.code==='email_not_confirmed'){
        msg = '邮箱已发送，请前往邮箱确认授权';
      }
      return NextResponse.json({ msg,error }, { status: 500 });
    }
    let userInfo = null;
    let bloggerInfo = null;
    if(data?.user?.id){
      const { data: userInfoArr , error:usersError } = await supabase
          .from('users')
          // .select('id, user_name, email, user_token,bloggerInfo:bloggers(id,user_id,domain,avatar_url)')
          .select('id, user_name, email, user_token,bloggerInfo:bloggers(domain,avatar_url)')
          .eq('user_id', data?.user?.id)
          .eq('bloggers.domain', blogger)
          .limit(1);
        userInfo = userInfoArr?.[0] || null;
        bloggerInfo = userInfo?.bloggerInfo?.[0] || {} as {domain:string,avatar_url:string};
        // let bloggerInfo = userInfo?.bloggerInfo?.[0] || {} as {domain:string,avatar_url:string};
        // if (usersError) {
        //   return NextResponse.json({ msg: '获取用户信息出错', error }, { status: 500 });
        // }
        // if(!userInfo){
        //   return NextResponse.json({ msg: '用户信息不存在', error }, { status: 500 });
        // }
        // return NextResponse.json({ data: { isLogin: true, isBlogger:!!(blogger == bloggerInfo?.domain),userInfo,bloggerInfo } }, { status: 200 });
    }
    return NextResponse.json({ data:{...data,customData:{userInfo,isLogin:!!userInfo,isBlogger:!!(blogger == bloggerInfo?.domain),bloggerInfo}},msg:'sign-in success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error,msg: 'sign-in Error' }, { status: 500 });
  }
}