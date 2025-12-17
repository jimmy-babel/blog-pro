import React, { useEffect, useState, useCallback, useRef } from "react";
import { life_styles } from "@/lib/supabase";
import { useJumpAction } from "@/lib/use-helper/base-mixin";
import PageScroll from "@/components/page-scroll/PageScroll";
import Image from "next/image";

type Props = {
  listData: Array<life_styles>;
  onScrollEnd?: () => void; // 滚动到底部的回调函数
};

const cloudinaryLoader = ({
  src = "",
  width = 110,
  quality = 100,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // 提取Cloudinary图片的public_id（即路径中最后的文件名部分）
  const publicId = src.split("/").pop();
  // 拼接Cloudinary支持的变换参数（路径格式）
  const transformations = ["f_auto", `w_${width}`, `q_${quality}`].join(",");
  // 生成最终URL
  return `https://res.cloudinary.com/dhfjn2vxf/image/upload/${transformations}/${publicId}`;
};

const List = (props: Props) => {
  const { listData, onScrollEnd } = props;
  const { jumpAction } = useJumpAction();
  const [listBox, setListBox] = useState<React.ReactNode>(null);
  useEffect(() => {
    setListBox(
      // <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-15 gap-y-12 w-full pt-8 pb-8">
      // <div className={`grid grid-cols-[repeat(auto-fit,minmax(180px,${listData.length >= 3 ? '1fr' : '200px'}))] gap-x-15 gap-y-12 w-full pt-8 pb-8`}>
      <div className={`grid ${listData.length>=4?'grid-cols-[repeat(auto-fit,minmax(180px,1fr))]':'grid-cols-[repeat(auto-fit,minmax(180px,200px))]'} gap-x-15 gap-y-12 w-full pt-8 pb-8`}>
        {listData.map((item) => (
          <div className="anim-op-y" key={item.id}>
            <div className="list anim-hover-scale-sm rounded-xl overflow-hidden text-2xs w-full cursor-pointer box-shadow">
              <div
                className="album-box"
                onClick={() => jumpAction(`web/lifestyles/${item.id}`)}
              >
                <div className="cover-box aspect-square relative">
                  {item.cover_img && (
                    <Image
                      loader={cloudinaryLoader}
                      src={item.cover_img || ""}
                      alt=""
                      fill
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4 border-t border-color">
                  <div>{item.title}</div>
                  <div className="text-xs text-gray-400 pt-1">
                    {item.created_at}
                  </div>
                  <div className="text-[15px] pt-2">查看相册</div>
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
