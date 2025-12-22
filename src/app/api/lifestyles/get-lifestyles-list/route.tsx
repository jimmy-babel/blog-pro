import { NextResponse } from "next/server";
import { getLifeStylesList } from '@/apis/lifestyles/lifestyles';
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const blogger = url.searchParams.get("blogger");
    const search = url.searchParams.get("search");
    const labelId = url.searchParams.get("labelId");
    if (!blogger) {
      return NextResponse.json({ error: "缺少 blogger 参数" }, { status: 400 });
    }

    const result = await getLifeStylesList({
      blogger,
      search: search || undefined,
      labelId: labelId || undefined
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    //console.error("获取生活手记时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
