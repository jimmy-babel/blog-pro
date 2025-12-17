import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url); //GET请求获取URL
    const userId = url.searchParams.get('userId');
    const search = url.searchParams.get('search'); // GET获取查询参数中的search
    const { data: articleGroupsData, error: articleGroupsError } = await supabase
      .from('article_groups')
      .select('id, name, sort')
      .eq('user_id', userId)
      .ilike('name', `%${search||""}%`)
      .order('sort');
    
    if (articleGroupsError) {
      return NextResponse.json({ msg: '获取文章时出错', error:articleGroupsError }, { status: 500 });
    }

    if (!articleGroupsData || articleGroupsData.length === 0) {
      return NextResponse.json({ data: [],  }, { status: 200 });
    }
    
    return NextResponse.json({ data:articleGroupsData, }, { status: 200 });

  } catch (error) {
    console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}