import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function POST(req: Request) {
  try {
    const { id, date, emoji, emoji_key, note, blogger } = await req.json();

    // 数据验证
    if (!date) {
      return NextResponse.json({ msg: '日期不能为空' }, { status: 400 });
    }

    if (!emoji || !emoji_key) {
      return NextResponse.json({ msg: '心情表情和表情键不能为空' }, { status: 400 });
    }

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


    // 格式化日期为 YYYY-MM-DD 格式
    const formattedDate = dayjs(date).format('YYYY-MM-DD');

    let result;

    if (!id || id === 0) {
      // 新增心情记录
      const { data, error } = await supabase
        .from('mood_records')
        .insert({
          date: formattedDate,
          emoji,
          emoji_key,
          note: note || '',
          user_id:userId
        })
        .select('id');

      if (error) {
        console.error('新增心情记录失败:', error);
        return NextResponse.json({ msg: '新增心情记录失败', error }, { status: 500 });
      }

      result = data?.[0]?.id;
    } else {
      // 更新心情记录
      const { data, error } = await supabase
        .from('mood_records')
        .update({
          date: formattedDate,
          emoji,
          emoji_key,
          note: note || '',
          updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('id');

      if (error) {
        console.error('更新心情记录失败:', error);
        return NextResponse.json({ msg: '更新心情记录失败', error }, { status: 500 });
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ msg: '未找到该心情记录或无权限更新' }, { status: 404 });
      }

      result = data?.[0]?.id;
    }

    return NextResponse.json({ data: result, msg: '操作成功' }, { status: 200 });

  } catch (error) {
    console.error('处理心情记录时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}