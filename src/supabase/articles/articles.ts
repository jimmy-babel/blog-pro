import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import { ArticlesInfo, ResData, FAILRES, SUCCESSRES } from "@/types";
interface Props {
  blogger: string;
  search?: string;
  groupsId?: string;
  platform?: string;
}
export async function getArticlesList(
  props: Props
): Promise<ResData<ArticlesInfo[]>> {
  try {
    const { blogger, search, groupsId, platform } = props;
    // 获取userId
    const { data: bloggerInfo, error: bloggerError } = await supabase
      .from("bloggers")
      .select("users(id)")
      .eq("domain", blogger)
      .limit(1);
    if (bloggerError) {
      return FAILRES.ARRAY;
    }
    let users: any = bloggerInfo?.[0]?.users || {};
    const userId = users?.id || "";
    if (!userId) {
      return FAILRES.ARRAY;
    }

    // 处理 groupsId 数组
    let groupsIdArray: number[] = [];
    if (groupsId) {
      groupsIdArray = groupsId
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0);
    }

    // 1. 初始化基础查询（PostgrestQueryBuilder 类型）
    // 根据是否按分组筛选，使用 PostgREST 的关系选择器（!inner）而不是不存在的 join 方法
    let query;

    if (groupsIdArray.length > 0) {
      // 使用关系选择并指定 inner 以实现等价的内连接行为（要求在数据库中定义了 articles -> article_groups_relation 的关系）
      // 这里选取 articles 的全部字段，并通过 article_groups_relation 的 group_id 进行筛选
      query = supabase
        .from("articles")
        .select(
          `*, 
          article_groups_relation!inner(group_id,article_groups(id, name))`,
          { count: "exact" }
        )
        .in("article_groups_relation.group_id", groupsIdArray);
    } else {
      query = supabase.from("articles").select(
        `
          *,
          article_groups_relation (
            group_id,
            article_groups(id, name)
          )`,
        { count: "exact" }
      );
    }

    // 4. 执行筛选逻辑（eq、ilike 等，需在 select 之后）
    query = query
      .eq("user_id", userId); // 筛选博主的文章
      if(platform == 'web'){
        query = query.eq("published", true);
      };
      query.ilike("title", `%${search || ""}%`); // 搜索关键词

    // 6. 排序（最后执行排序）
    query = query.order("created_at", { ascending: false });

    // 执行查询
    const { data: articlesData, error: articlesError, count } = await query;

    if (articlesError) {
      return FAILRES.ARRAY;
    }

    // 提取纯文章数据（过滤关联表的冗余字段）
    const result =
      articlesData?.map((article: any) => {
        return {
          ...article,
          created_at: dayjs(article.created_at).format("YYYY-MM-DD HH:mm:ss"),
          updated_at: dayjs(article.updated_at).format("YYYY-MM-DD HH:mm:ss"),
        };
      }) || [];
    console.log("-----------API getArticlesList", result);
    return { ...SUCCESSRES.ARRAY, data: result || [] };
  } catch (error) {
    //console.error("API getArticlesList", error);
    return FAILRES.ARRAY;
  }
}
