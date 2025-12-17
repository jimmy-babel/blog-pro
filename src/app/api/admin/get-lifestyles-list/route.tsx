import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // const blogger = url.searchParams.get("blogger");
    let userId = url.searchParams.get("userId");
    const search = url.searchParams.get("search");
    const labelIdStr = url.searchParams.get("labelId");
    let labelIdArray: number[] = [];
    if (labelIdStr) {
      labelIdArray = labelIdStr
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0);
    }
    let query;
    query = supabase
      .from("life_styles")
    if (labelIdArray.length > 1) {
      query = query
        .select('*,life_styles_to_label!inner(label_id),life_styles_to_sub_label!inner(sub_label_id)',{ count: "exact" })
        .eq('life_styles_to_label.label_id',labelIdArray[0])
        .eq('life_styles_to_sub_label.sub_label_id',labelIdArray[1])
    } else if (labelIdArray.length > 0) {
      query = query
      .select("*,life_styles_to_label!inner(label_id)", { count: "exact" })
      .eq('life_styles_to_label.label_id',labelIdArray[0])
    }else{
      query = query.select("*", { count: "exact" });
    }
    query = query
      .eq('user_id', userId) // 筛选博主的文章
      .ilike('title', `%${search || ''}%`)
      .order('created_at', { ascending: false })

    const { data: lifeStylesData, error: lifeStylesError, count } = await query;
    if (lifeStylesError) {
      return NextResponse.json(
        { msg: "获取生活手记时出错", error: lifeStylesError },
        { status: 500 }
      );
    }
    // 格式化时间
    const result = lifeStylesData.map((item:any) => ({
      ...item,
      created_at: item.created_at && dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss") || "",
      updated_at: item.updated_at && dayjs(item.updated_at).format("YYYY-MM-DD HH:mm:ss") || "",
    }));
    return NextResponse.json(
      {
        data: result || [],
        count: count || 0, // 使用 select 返回的精确 count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取文章时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
