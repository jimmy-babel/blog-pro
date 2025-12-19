import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getBloggerInfo } from '@/app/api/apis/common/blogger-info';
import { ApiCode } from '@/types';
export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url); //GET请求获取URL
    const blogger = url.searchParams.get('blogger');
    if(!blogger){
      return NextResponse.json({ msg: '缺少传参' }, { status: 400 });
    }
    // 获取userId
    const {code,data} = await getBloggerInfo(blogger);
    if(code === ApiCode.FAIL){
      return NextResponse.json({ msg: '博主不存在' }, { status: 400 });
    }
    return NextResponse.json({ data: data || {} }, { status: 200 });
  } catch (error) {
    //console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}