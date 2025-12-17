import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url); //GET请求获取URL
    const blogger = url.searchParams.get('blogger');
    if(!blogger){
      return NextResponse.json({ msg: '缺少传参' }, { status: 400 });
    }
    // 获取userId
    const { data: bloggerInfo, error: bloggerError } = await supabase
      .from('bloggers')
      .select('*')
      .eq('domain', blogger)
      .limit(1)

    if (bloggerError) {
      return NextResponse.json({ msg: '获取博主信息出错', error: bloggerError }, { status: 500 });
    }
    if(!bloggerInfo?.[0]){
      return NextResponse.json({ msg: '博主不存在' }, { status: 400 });
    }
    return NextResponse.json({ data: bloggerInfo?.[0] || {} }, { status: 200 });
  } catch (error) {
    console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}