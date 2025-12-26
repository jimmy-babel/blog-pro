import { ResData, FAILRES, SUCCESSRES } from "@/types";
import { supabase } from "@/supabase/supabase";

interface Props {
  id: string;
}

export async function deleteLifeStyles(props: Props): Promise<ResData<number>> {
  const { error } = await supabase
    .from("life_styles")
    .update({
      is_deleted: 1,
    })
    .eq("id", parseInt(props.id))
    .select()
  if (error) {
    return {...FAILRES.NULL,data:0};
  }
  return {
    ...SUCCESSRES.NUMBER,
    data: parseInt(props.id),
  };
}
