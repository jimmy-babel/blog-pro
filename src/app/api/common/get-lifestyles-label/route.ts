import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url); //GET请求获取URL
    const userId = url.searchParams.get('userId');
    const search = url.searchParams.get('search'); // GET获取查询参数中的search
    const { data: lifeStylesLabelData, error: lifeStylesLabelError } = await supabase
      .from('life_styles_label')
      .select(`id, name, sort,
        children:life_styles_sub_label(id, name, sort)
      `)
      .order('sort', { ascending: true })
      .order('sort', { referencedTable: 'life_styles_sub_label', ascending: true }); 

      // .eq('user_id', userId)
      // .ilike('name', `%${search||""}%`)
      // .order('sort');
    
    if (lifeStylesLabelError) {
      return NextResponse.json({ msg: '获取文章时出错', error:lifeStylesLabelError }, { status: 500 });
    }

    if (!lifeStylesLabelData || lifeStylesLabelData.length === 0) {
      return NextResponse.json({ data: [],  }, { status: 200 });
    }
    
    return NextResponse.json({ data:lifeStylesLabelData, }, { status: 200 });

  } catch (error) {
    console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}