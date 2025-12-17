import React, { useEffect, useState, useCallback, useRef } from 'react'
import {article} from '@/lib/supabase';
import {useJumpAction} from "@/lib/use-helper/base-mixin"
import PageScroll from "@/components/page-scroll/PageScroll";
type Props = {
  listData: Array<article>,
  onScrollEnd?: () => void; // 滚动到底部的回调函数
}

const List = (props: Props) => {
  const {listData, onScrollEnd} = props;
  const {jumpAction} = useJumpAction();
  const [listBox,setListBox] = useState<React.ReactNode>(null);
  useEffect(()=>{
    setListBox(
       (
        <div className='list-box'>
          {listData.map(item =>(
            <div onClick={()=>jumpAction(`web/articles/${item.id}`)} key={item.id} className='pt-7 pb-7 anim-hover-x cursor-pointer anim-hover-a border-b border-b-[rgba(127,127,127,0.1)]'>
              <div className='text-xl font-bold'>{item.title}</div>
              <div className='pt-4 pb-4 text-gray-400'>{item.excerpt||""}</div>
              <div className='flex text-gray-400 gap-2'>
                <div className=''>{item.created_at}</div>
                {item.article_groups_relation?.map(group=>(
                  <div key={group.group_id} className='pr-2'>#{group.article_groups?.name}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    )
  },[listData])

  return (
    <div className='w-full anim-op-y'>
      <PageScroll listElement={listBox} isEmpty={listData.length === 0} onScrollEnd={onScrollEnd} />
    </div>
  )
}

export default List