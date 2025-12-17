import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url); //GET请求获取URL
    const blogger = url.searchParams.get("blogger"); // GET获取查询参数中的blogger
    const id = url.searchParams.get("id"); // GET获取查询参数中的id

    // 检查 blogger 是否存在（避免后续调用 toUpperCase/toLowerCase 时报错）
    if (!blogger || !id) {
      return NextResponse.json({ error: "缺少传参" }, { status: 400 });
    }

   // 获取userId
    const { data: bloggerInfo, error: bloggerError } = await supabase
      .from('bloggers')
      .select('users(*)')
      .eq('domain', blogger)
      .limit(1)

    if (bloggerError) {
      return NextResponse.json({ msg: '获取博主信息出错', error: bloggerError }, { status: 500 });
    }
    let users : any = bloggerInfo?.[0]?.users||{};
    const userId = users?.id || "";
    if(!userId){
      return NextResponse.json({ error: '博主不存在' }, { status: 400 });
    }
    // 获取文章数据
    // console.log('supabase select from articles');
    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("*,articles_content(*)")
      .eq("published", true)
      .eq("id", id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .single();
    // console.log('supabase select from articles then:',articlesData,articlesError);
    if (articlesError) {
      return NextResponse.json(
        { msg: "获取文章详情时出错1", error: articlesError },
        { status: 500 }
      );
    }

    // 获取文章标签
    const { data: labelsData, error: labelsError } = await supabase
      .from("article_groups_relation")
      .select("group_id")
      .eq("article_id", id);

    if (labelsError) {
      return NextResponse.json(
        { msg: "获取文章标签时出错", error: labelsError },
        { status: 500 }
      );
    }
    // 获取文章标签名称
    const { data: article_groups, error: article_groupsError } = await supabase
      .from("article_groups")
      .select("id,name")
      .in(
        "id",
        labelsData?.map((item) => item.group_id)
      );

    if (article_groupsError) {
      return NextResponse.json(
        { msg: "获取文章标签名称时出错", error: article_groupsError },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...articlesData,
          created_at:
            (articlesData?.created_at &&
              dayjs(articlesData?.created_at).format("YYYY-MM-DD HH:mm:ss")) ||
            "",
          updated_at:
            (articlesData?.updated_at &&
              dayjs(articlesData?.updated_at).format("YYYY-MM-DD HH:mm:ss")) ||
            "",
          labels: article_groups,
        },
        bloggerInfo:users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取文章详情时出错2:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
