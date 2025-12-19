import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const blogger = url.searchParams.get('blogger');
    const search = url.searchParams.get('search');
    const groupsIdStr = url.searchParams.get('groupsId');

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

    // 处理 groupsId 数组
    let groupsIdArray: number[] = [];
    if (groupsIdStr) {
      groupsIdArray = groupsIdStr
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0);
    }

    // 1. 初始化基础查询（PostgrestQueryBuilder 类型）
    // 根据是否按分组筛选，使用 PostgREST 的关系选择器（!inner）而不是不存在的 join 方法
    let query;

    if (groupsIdArray.length > 0) {
      // 使用关系选择并指定 inner 以实现等价的内连接行为（要求在数据库中定义了 articles -> article_groups_relation 的关系）
      // 这里选取 articles 的全部字段，并通过 article_groups_relation 的 group_id 进行筛选
      query = supabase
        .from('articles')
        .select(`*, 
          article_groups_relation!inner(group_id,article_groups(id, name))`, { count: 'exact' })
        .in('article_groups_relation.group_id', groupsIdArray);
    } else {
      query = supabase
        .from('articles')
        .select(`
          *,
          article_groups_relation (
            group_id,
            article_groups(id, name)
          )`, { count: 'exact' });
    }

    // 4. 执行筛选逻辑（eq、ilike 等，需在 select 之后）
    query = query
      .eq('user_id', userId) // 筛选博主的文章
      .eq('published', true) // 筛选已发布的文章
      .ilike('title', `%${search || ''}%`); // 搜索关键词

    // 6. 排序（最后执行排序）
    query = query.order('created_at', { ascending: false });

    // 执行查询
    const { data: articlesData, error: articlesError, count } = await query;
    
    if (articlesError) {
      return NextResponse.json({ msg: '获取文章时出错', error: articlesError }, { status: 500 });
    }

    // 提取纯文章数据（过滤关联表的冗余字段）
    const result = articlesData?.map((article:any) => {
      // 删除关联表的嵌套字段，只保留文章本身的字段
      const { article_groups_relation, ...rest } = article;
      return {...rest,article_groups_relation,created_at:dayjs(rest.created_at).format('YYYY-MM-DD HH:mm:ss'),updated_at:dayjs(rest.updated_at).format('YYYY-MM-DD HH:mm:ss'),};
    }) || [];
    
    
    return NextResponse.json(
      {
        data: result || [],
        count: count || 0 // 使用 select 返回的精确 count
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}