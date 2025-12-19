import { supabase } from '@/lib/supabase';
import { BloggerInfo,ResData,FAILRES,SUCCESSRES} from '@/types';

// 抽离获取博主信息的核心逻辑
export async function getBloggerInfo(blogger: string): Promise<ResData<BloggerInfo>> {
  if (!blogger) {
    return FAILRES.OBJECT
  }
  const { data: bloggerInfo, error } = await supabase
    .from('bloggers')
    .select('avatar_url,user_name,introduce1,introduce2,motto1,motto2')
    .eq('domain', blogger)
    .limit(1);
  if (error) {
    //console.error('数据库查询博主信息出错:', error);
    return FAILRES.OBJECT
  }
  return {...SUCCESSRES.OBJECT,data:bloggerInfo?.[0] || {}}
}