import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const {
      id,
      title,
      cover_img,
      photos,
      excerpt,
      published,
      user_id,
      labelIds,
    } = await req.json();
    // console.log('photos',photos);
    console.log('labelIds',labelIds);
    let [relationsIds, sub_relationsIds] = [[] as number[], [] as number[]];
    labelIds.forEach((item: any, index: number) => {
      if (Array.isArray(item)) {
        //多选
        item.forEach((cItem, cIndex) => {
          if (cIndex == 0) {
            relationsIds.push(Number(cItem));
          } else if (cIndex == 1) {
            sub_relationsIds.push(Number(cItem));
          }
        });
      } else {
        //单选
        if (index == 0) {
          relationsIds.push(Number(item));
        } else if (index == 1) {
          sub_relationsIds.push(Number(item));
        }
      }
    });
    console.log('relationsIds',relationsIds);
    console.log('sub_relationsIds',sub_relationsIds);
    if (!id || id === 0) { //新增
      const { data, error } = await supabase
        .from("life_styles")
        .insert({ title, cover_img, excerpt, published, user_id })
        .select();
      if (error) {
        return NextResponse.json(
          { msg: "新增生活手记时出错", error },
          { status: 500 }
        );
      }
      const newArticleId = data?.[0]?.id || null;
      // 更新表 life_styles_to_label
      if (relationsIds.length > 0) {
        const relations = relationsIds.map((label_id: number) => ({
          life_styles_id: newArticleId,
          label_id,
        }));
        console.log('relations',relations);
        const { error: relationError } = await supabase
          .from("life_styles_to_label")
          .insert(relations);
        if (relationError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但标签分组关联失败", error: relationError },
            { status: 500 }
          );
        }
      }
      // 更新表 life_styles_to_sub_label
      if (sub_relationsIds.length > 0) {
        const sub_relations = sub_relationsIds.map((sub_label_id: number) => ({
          life_styles_id: newArticleId,
          sub_label_id,
        }));
        console.log('sub_relations',sub_relations);
        const { error: relationError } = await supabase
          .from("life_styles_to_sub_label")
          .insert(sub_relations);
        if (relationError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但子标签分组关联失败", error: relationError },
            { status: 500 }
          );
        }
      }
      // 更新表 life_styles_photos
      if (photos?.length > 0) {
        const photos_relations = photos.map((item: any, index: number) => ({
          life_styles_id: newArticleId,
          user_id: user_id,
          url: item.url,
          sort: index,
          excerpt: item.excerpt || "",
        }));
        const { error: photosError } = await supabase
          .from("life_styles_photos")
          .insert(photos_relations);
        if (photosError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但图片关联失败", error: photosError },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { data: newArticleId, msg: "生活手记新增成功" },
        { status: 200 }
      );
    } else { //编辑
      const { data, error } = await supabase
        .from("life_styles")
        .update({ title, cover_img, excerpt, published })
        .eq("id", id)
        .select();
      if (error) {
        return NextResponse.json(
          { msg: "编辑生活手记时出错", error },
          { status: 500 }
        );
      }

      // 先彻底删除该生活手记的所有旧关联(标签、子标签、相册)
      const { error: labelError } = await supabase
        .from("life_styles_to_label")
        .delete()
        .eq("life_styles_id", id);
      if (labelError) {
        return NextResponse.json(
          { msg: "删除旧分组关联失败", error: labelError },
          { status: 500 }
        );
      }
      const { error: subLabelError } = await supabase
        .from("life_styles_to_sub_label")
        .delete()
        .eq("life_styles_id", id);
      if (subLabelError) {
        return NextResponse.json(
          { msg: "删除旧分组关联失败", error: subLabelError },
          { status: 500 }
        );
      }
      const { error: photosDeleteError } = await supabase
        .from("life_styles_photos")
        .delete()
        .eq("life_styles_id", id);
      if (photosDeleteError) {
        return NextResponse.json(
          { msg: "删除相册失败", error: photosDeleteError },
          { status: 500 }
        );
      }

      // 更新表 life_styles_to_label （删完后重新插入
      if (relationsIds.length > 0) {
        const relations = relationsIds.map((label_id: number) => ({
          life_styles_id: id,
          label_id,
        }));
        const { error: relationError } = await supabase
          .from("life_styles_to_label")
          .insert(relations);
        if (relationError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但分组关联失败", error: relationError },
            { status: 500 }
          );
        }
      }

      // 更新表 life_styles_to_sub_label
      if (sub_relationsIds.length > 0) {
        const sub_relations = sub_relationsIds.map((sub_label_id: number) => ({
          life_styles_id: id,
          sub_label_id,
        }));
        const { error: relationError } = await supabase
          .from("life_styles_to_sub_label")
          .insert(sub_relations);
        if (relationError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但分组关联失败", error: relationError },
            { status: 500 }
          );
        }
      }
      // 更新表 life_styles_photos
      if (photos?.length > 0) {
        const photos_relations = photos.map((item: any, index: number) => ({
          life_styles_id: id,
          user_id: user_id,
          url: item.url,
          sort: index,
          excerpt: item.excerpt || "",
        }));
        const { error: relationError } = await supabase
          .from("life_styles_photos")
          .insert(photos_relations);
        if (relationError) {
          return NextResponse.json(
            { msg: "生活手记新增成功，但图片关联失败", error: relationError },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { data: data?.[0]?.id, msg: "生活手记编辑成功" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("获取生活手记时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
