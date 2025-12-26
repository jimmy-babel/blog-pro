"use client"
import React, { useEffect, useState, useCallback, useRef } from "react";
import { life_styles } from "@/supabase/supabase";
import { useJumpAction } from "@/lib/hooks/base-hooks";
import { ImageLoader } from "@/lib/mixins/base-mixin";
import PageScroll from "@/components/common/page-scroll/PageScroll";
import Image from "next/image";
import {LifeStylesInfo,ResData} from "@/types"

type Props = {
  listData: Array<LifeStylesInfo>;
  onScrollEnd?: () => void; // 滚动到底部的回调函数
};

const List = (props: Props) => {
  const { listData, onScrollEnd } = props;
  const { jumpAction } = useJumpAction();
  const [listBox, setListBox] = useState<React.ReactNode>(null);
  console.log('listData',listData);
  useEffect(() => {
    setListBox(
      // <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-15 gap-y-12 w-full pt-8 pb-8">
      // <div className={`grid grid-cols-[repeat(auto-fit,minmax(180px,${listData.length >= 3 ? '1fr' : '200px'}))] gap-x-15 gap-y-12 w-full pt-8 pb-8`}>
      <div className={`grid ${listData.length>=4?'grid-cols-[repeat(auto-fit,minmax(180px,1fr))]':'grid-cols-[repeat(auto-fit,minmax(180px,200px))]'} gap-x-15 gap-y-12 w-full pt-8 pb-8`}>
        {listData.map((item) => (
          <div className="anim-op-y" key={'id_'+item.id}>
            <div className="list anim-hover-scale-sm rounded-xl overflow-hidden text-2xs w-full cursor-pointer box-shadow">
              <div
                className="album-box"
                onClick={() => jumpAction(`/lifestyles/${item.id}`)}
              >
                <div className="cover-box aspect-square relative">
                  {item.cover_img && (
                    <Image
                      loader={ImageLoader.cloudinary}
                      src={item.cover_img || ""}
                      alt=""
                      fill
                      sizes="200px"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="pt-3 pb-3 pl-4 pr-4 border-t border-color">
                  <div>{item.title}</div>
                  <div className="text-xs text-gray-400 pt-1">
                    {item.sort_time}
                  </div>
                  <div className='flex items-center leading-8 text-gray-500 text-sm gap-2'>
                    {item.life_styles_label?.map((label) => (
                      <span key={label.id} >
                        #{label.name}
                      </span>
                    ))}
                    {item.life_styles_sub_label?.map((label) => (
                      <span key={label.id} className='flex items-center leading-8 text-gray-500 text-sm'>
                        #{label.name}
                      </span>
                    ))}
                  </div>
                  {/* <div className="text-[14px] pt-2">查看相册</div> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [listData]);

  return (
    <div className="w-full anim-op-y">
      <PageScroll listElement={listBox} isEmpty={listData.length === 0} onScrollEnd={onScrollEnd} />
    </div>
  );
};

export default List;
