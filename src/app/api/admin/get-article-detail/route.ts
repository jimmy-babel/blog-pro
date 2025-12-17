import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url); //GET请求获取URL
    // const blogger = url.searchParams.get("blogger"); // GET获取查询参数中的blogger
    const id = url.searchParams.get("id"); // GET获取查询参数中的id
    let userId = url.searchParams.get("userId");

    // 获取文章数据
    const { data, error: articlesError } = await supabase
      .from("articles")
      .select("*,articles_content(*)")
      .eq('published', true)
      .eq("id", id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (articlesError) {
      return NextResponse.json(
        { msg: "获取文章详情时出错", error: articlesError },
        { status: 500 }
      );
    }

    const articlesData = data?.[0] || null;
    if (!articlesData) {
      return NextResponse.json(
        { data: null, },
        { status: 200 }
      );
    }

    // 获取分组关系
    const {
      data: articleGroupsRelationData,
      error: articleGroupsRelationError,
    } = await supabase
      .from("article_groups_relation")
      .select("group_id")
      .eq("article_id", id);
    if (articleGroupsRelationError) {
      return NextResponse.json(
        { msg: "获取分组关系出错", error: articleGroupsRelationError },
        { status: 500 }
      );
    }
    let groupsId = articleGroupsRelationData.map((item) => item.group_id);

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
          groupsId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取文章详情时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
