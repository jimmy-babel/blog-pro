import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    } = await req.json();
    const { data,error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if(error){
      let msg = error.code;
      if(error.code==='email_not_confirmed'){
        msg = '邮箱未确认授权，请前往确认';
      }
      return NextResponse.json({ msg,error }, { status: 500 });
    }
    return NextResponse.json({ data,msg:'sign-in success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error,msg: 'sign-in Error' }, { status: 500 });
  }
}