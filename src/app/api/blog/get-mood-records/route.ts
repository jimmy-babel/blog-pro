import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const blogger = url.searchParams.get('blogger');

    if (!blogger) {
      return NextResponse.json({ error: '缺少 blogger 参数' }, { status: 400 });
    }
    
   // 获取userId
    const { data: bloggerInfo, error: bloggerError } = await supabase
      .from('bloggers')
      .select('users(id)')
      .eq('domain', blogger)
      .limit(1);

    if (bloggerError) {
      return NextResponse.json({ msg: '获取博主信息出错', error: bloggerError }, { status: 500 });
    }
    
    let users : any = bloggerInfo?.[0]?.users||{};
    const userId = users?.id || "";
    if(!userId) {
      return NextResponse.json({ error: '博主不存在' }, { status: 400 });
    }

    // 查询心情记录
    const { data: moodRecords, error: moodRecordsError } = await supabase
      .from('mood_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (moodRecordsError) {
      return NextResponse.json({ msg: '获取心情记录时出错', error: moodRecordsError }, { status: 500 });
    }

    // 处理日期格式
    const result = moodRecords?.map((record: any) => {
      return {
        ...record,
        date: dayjs(record.date).format('YYYY-MM-DD'),
        created_at: dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss'),
        updated_at: dayjs(record.updated_at).format('YYYY-MM-DD HH:mm:ss')
      };
    }) || [];
    
    return NextResponse.json(
      {
        data: result || [],
        count: result.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('获取心情记录时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}