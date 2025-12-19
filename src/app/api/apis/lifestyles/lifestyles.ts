 import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import { LifeStylesInfo, ResData, FAILRES, SUCCESSRES } from "@/types";

interface Props {
  blogger: string;
  search?: string;
  labelId?: string;
}

export async function getLifeStylesList(
  props: Props
): Promise<ResData<LifeStylesInfo[]>> {
  try {
    const { blogger, search, labelId } = props;

    if (!blogger) {
      return FAILRES.ARRAY;
    }

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

    let labelIdArray: number[] = [];
    if (labelId) {
      labelIdArray = labelId
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0);
    }

    let query;
    query = supabase.from("life_styles");

    if (labelIdArray.length > 1) {
      query = query
        .select(
          "*,life_styles_to_label!inner(label_id),life_styles_to_sub_label!inner(sub_label_id)",
          { count: "exact" }
        )
        .eq("life_styles_to_label.label_id", labelIdArray[0])
        .eq("life_styles_to_sub_label.sub_label_id", labelIdArray[1]);
    } else if (labelIdArray.length > 0) {
      query = query
        .select("*,life_styles_to_label!inner(label_id)", { count: "exact" })
        .eq("life_styles_to_label.label_id", labelIdArray[0]);
    } else {
      query = query.select("*", { count: "exact" });
    }

    query = query
      .eq("user_id", userId) // 筛选博主的文章
      .ilike("title", `%${search || ""}%`)
      .order("created_at", { ascending: false });

    const { data: lifeStylesData, error: lifeStylesError, count } = await query;

    if (lifeStylesError) {
      return FAILRES.ARRAY;
    }

    const result = lifeStylesData?.map((item) => ({
      ...item,
      created_at: item.created_at ? dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss") : "",
      updated_at: item.updated_at ? dayjs(item.updated_at).format("YYYY-MM-DD HH:mm:ss") : "",
    })) || [];

    return { ...SUCCESSRES.ARRAY, data: result || [] };
  } catch (error) {
    console.error("API getLifeStylesList", error);
    return FAILRES.ARRAY;
  }
}