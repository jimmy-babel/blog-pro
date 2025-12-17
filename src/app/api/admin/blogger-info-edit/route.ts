import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const {user_name="",introduce1="",introduce2="",motto1="",motto2="",blogger} = await req.json();
    if(!blogger){
      return NextResponse.json({ error: '参数缺失' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('bloggers')
      .update({
        user_name,
        introduce1,
        introduce2,
        motto1,
        motto2,
      })
      .eq('domain', blogger);
    if (error) {
      throw error;
    }
    return NextResponse.json({ data, msg: '更新成功' }, { status: 200 });


  } catch (error) {
    console.error('更新博主信息时出错:', error);
    return NextResponse.json({ msg: '服务器内部错误',error }, { status: 500 });
  }
}