import { NextResponse } from 'next/server';
import { getArticlesList } from '@/supabase/articles/articles';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const blogger = url.searchParams.get('blogger');
    const search = url.searchParams.get('search');
    const groupsId = url.searchParams.get('groupsId');
    const platform = url.searchParams.get('platform');

    if (!blogger) {
      return NextResponse.json({ error: '缺少 blogger 参数' }, { status: 400 });
    }

    const result = await getArticlesList({
      blogger,
      search: search || undefined,
      groupsId: groupsId || undefined,
      platform: platform || undefined
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    //console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}