import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url); //GET请求获取URL
    const blogger = url.searchParams.get('blogger'); // GET获取查询参数中的blogger
    const search = url.searchParams.get('search'); // GET获取查询参数中的search

    // 检查 blogger 是否存在（避免后续调用 toUpperCase/toLowerCase 时报错）
    if (!blogger) {
      return NextResponse.json({ error: '缺少 blogger 参数' }, { status: 400 });
    }
   // 获取userId
    const { data: bloggerInfo, error: bloggerError } = await supabase
      .from('bloggers')
      .select('users(id)')
      .eq('domain', blogger)
      .limit(1)

    if (bloggerError) {
      return NextResponse.json({ msg: '获取博主信息出错', error: bloggerError }, { status: 500 });
    }
    console.log('bloggerInfo',bloggerInfo);
    let users : any = bloggerInfo?.[0]?.users||{};
    const userId = users?.id || "";
    if(!userId){
      return NextResponse.json({ error: '博主不存在' }, { status: 400 });
    }

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