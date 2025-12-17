import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url); //GET请求获取URL
    // const blogger = url.searchParams.get("blogger"); // GET获取查询参数中的blogger
    const userId = url.searchParams.get("userId");
    const id = url.searchParams.get("id"); // GET获取查询参数中的id

    // 获取生活手记数据
    const { data, error: lifeStylesError } = await supabase
      .from("life_styles")
      .select("*,photos:life_styles_photos(id,url,excerpt,sort,created_at)")
      .eq("id", id)
      .eq("user_id", userId)
      .limit(1);
    // 等价于:
    // SELECT
    //   life_styles.id,
    //   life_styles.title,
    //   life_styles.excerpt,
    //   -- 其他主表字段...
    //   (
    //     SELECT json_agg(json_build_object(
    //       'id', life_styles_photos.id,
    //       'photo_url', life_styles_photos.photo_url,
    //       'caption', life_styles_photos.caption,
    //       'is_cover', life_styles_photos.is_cover,
    //       'sort_order', life_styles_photos.sort_order
    //     ))
    //     FROM life_styles_photos
    //     WHERE life_styles_photos.life_styles_id = life_styles.id  -- 自动添加的关联条件
    //   ) AS photos
    // FROM life_styles
    // WHERE life_styles.id = id

    
    if (lifeStylesError) {
      return NextResponse.json(
        { msg: "获取生活手记详情时出错", error: lifeStylesError },
        { status: 500 }
      );
    }
    
    const lifeStylesData = data?.[0] || null;
    if (!lifeStylesData) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    // 获取分组关系
    // const { data: articleGroupsRelationData, error: articleGroupsRelationError } = await supabase
    //   .from('article_groups_relation')
    //   .select('group_id')
    //   .eq('article_id',id)
    // if (articleGroupsRelationError) {
    //   return NextResponse.json({ msg: '获取分组关系出错', error:articleGroupsRelationError }, { status: 500 });
    // }
    // let groupsId = articleGroupsRelationData.map(item=>item.group_id)
    // return NextResponse.json({ data:{...lifeStylesData,groupsId} }, { status: 200 });
    const { data: life_styles_to_label, error: life_styles_to_label_error } =
      await supabase
        .from("life_styles_to_label")
        .select("label_id")
        .eq("life_styles_id", id);
    if (life_styles_to_label_error) {
      return NextResponse.json(
        { msg: "获取生活手记标签时出错", error: life_styles_to_label_error },
        { status: 500 }
      );
    }

    const {
      data: life_styles_to_sub_label,
      error: life_styles_to_sub_label_error,
    } = await supabase
      .from("life_styles_to_label")
      .select("label_id")
      .eq("life_styles_id", id);
    if (life_styles_to_sub_label_error) {
      return NextResponse.json(
        {
          msg: "获取生活手记子标签时出错",
          error: life_styles_to_sub_label_error,
        },
        { status: 500 }
      );
    }
    console.log("life_styles_to_label", life_styles_to_label);
    console.log("life_styles_to_sub_label", life_styles_to_sub_label);
    let labelIds =
      life_styles_to_label?.[0] && life_styles_to_sub_label?.[0]
        ? [
            life_styles_to_label[0].label_id,
            life_styles_to_sub_label[0].label_id,
          ]
        : [];

    return NextResponse.json(
      {
        data: {
          ...lifeStylesData,
          created_at:
            (lifeStylesData?.created_at &&
              dayjs(lifeStylesData?.created_at).format(
                "YYYY-MM-DD HH:mm:ss"
              )) ||
            "",
          updated_at:
            (lifeStylesData?.updated_at &&
              dayjs(lifeStylesData?.updated_at).format(
                "YYYY-MM-DD HH:mm:ss"
              )) ||
            "",
          labelIds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取生活手记详情时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
