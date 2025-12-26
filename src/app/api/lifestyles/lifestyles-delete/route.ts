import { NextResponse } from "next/server";
import { deleteLifeStyles } from "@/supabase/lifestyles/lifestyles-delete";
export async function POST(req: Request) {
  try {
    const {
      id,
    } = await req.json(); 

    const result = await deleteLifeStyles({
      id,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    //console.error("获取生活手记时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
