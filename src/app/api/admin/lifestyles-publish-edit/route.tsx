import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { id, published } = await req.json();
    const { data, error } = await supabase
      .from("life_styles")
      .update({ published })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { msg: "状态编辑时出错", error },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { data: data?.[0]?.id, msg: "状态编辑成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("状态编辑时出错:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}