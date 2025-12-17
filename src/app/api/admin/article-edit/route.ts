import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const {id, title, content="", delta_data="", cover_img, excerpt, published, user_id, groupsId} = await req.json();

    // 根据groupsId数组 更新表article_groups_relation
    const relations = groupsId.filter((item:number)=>item>0)?.map((groupId:number) => ({
      article_id: id,
      group_id: groupId
    }));
    // console.log('relations',relations);
    let getExcerpt = cleanHtmlTags(content);
    getExcerpt = getExcerpt?.slice(0, 200) || '';
    getExcerpt?.length == 200 && (getExcerpt += '...')
    if(!id || id === 0){
      const { data, error } = await supabase
        .from('articles')
        .insert({title,excerpt:getExcerpt, published, user_id, cover_img})
        .select()
      if (error) {
        return NextResponse.json({ msg: '新增文章时出错',error }, { status: 500 });
      }
      // 根据groupsId数组 更新表article_groups_relation
      const newArticle = data?.[0] || null;
      // const relations = groupsId?.map((groupId:number) => ({
      //   article_id: newArticle?.id,
      //   group_id: groupId
      // }));
      if(relations.length>0){
         const { error: relationError } = await supabase
          .from('article_groups_relation')
          .insert(relations);

        if (relationError) {
          // 注意：此处文章已创建但关联失败，根据业务需求可选择回滚（需额外逻辑）或提示错误
          return NextResponse.json(
            { msg: '文章新增成功，但分组关联失败', error: relationError },
            { status: 500 }
          );
        }
      }
      if(true||content){
        const { data, error } = await supabase
          .from('articles_content')
          .insert({content_id:newArticle?.id,content,delta_data})
        if(error){
          return NextResponse.json({ msg: '编辑文章内容时出错',error }, { status: 500 });
        }
      }
      return NextResponse.json({ data:newArticle?.id, msg:"文章新增成功"}, { status: 200 });
    }else{
      const { data, error } = await supabase
        .from('articles')
        .update({title,excerpt:getExcerpt,published,cover_img})
        .eq('id', id)
        .select()

      
      if (error) {
        return NextResponse.json({ msg: '编辑文章时出错',error }, { status: 500 });
      }


      // 先彻底删除该文章的所有旧关联（关键：避免新旧关联冲突）
      const { error: deleteError } = await supabase
        .from('article_groups_relation')
        .delete()
        .eq('article_id', id);

      if (deleteError) {
        return NextResponse.json(
          { msg: '删除旧分组关联失败', error: deleteError },
          { status: 500 }
        );
      }

      if(relations.length>0){
         const { error: relationError } = await supabase
          .from('article_groups_relation')
          .insert(relations);

        if (relationError) {
          // 注意：此处文章已创建但关联失败，根据业务需求可选择回滚（需额外逻辑）或提示错误
          return NextResponse.json(
            { msg: '文章新增成功，但分组关联失败', error: relationError },
            { status: 500 }
          );
        }
      }

      if(true||content){
        // const { data:articlesContent, error:articlesContentError } = await supabase
        //   .from('articles_content')
        //   .select('content_id')
        //   .eq('content_id', id)
        //   .limit(1)
        //   console.log('articlesContent',articlesContent,articlesContent?.length);
        // if(articlesContentError){
        //   return NextResponse.json({ msg: '编辑文章内容时出错',articlesContentError }, { status: 500 });
        // }
        const { data, error } = await supabase
          .from('articles_content')
          .update({content,delta_data})
          .eq('content_id', id)
          .select()
          // console.log('articles_content update',data,error);
        if(error){
          return NextResponse.json({ msg: '编辑文章内容时出错',error }, { status: 500 });
        }
      }


      return NextResponse.json({ data:data?.[0]?.id, msg:"文章编辑成功" }, { status: 200 });
    }


  } catch (error) {
    console.error('获取文章时出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

function cleanHtmlTags(htmlText:string, replaceWithSpace = true) {
  // 正则匹配所有HTML标签（<开头，>结尾，中间非>的任意字符）
  const tagRegex = /<[^>]+>/g;
  // 替换标签：空格 或 空字符串
  let result = htmlText.replace(tagRegex, replaceWithSpace ? ' ' : '');
  
  // 清理多余空白字符（制表符、多个空格、换行符等），统一替换为单个空格
  const whitespaceRegex = /\s+/g;
  result = result.replace(whitespaceRegex, ' ').trim(); // trim()去掉首尾空格
  
  return result;
}