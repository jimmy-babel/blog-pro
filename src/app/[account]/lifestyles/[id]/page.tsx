"use client";
// import  from 'react';
import React, { useEffect, useState } from "react";
import { life_styles, Blogger } from "@/supabase/supabase";
import { ImageLoader } from "@/lib/mixins/base-mixin";
import Image from "next/image";
import { UserOutlined, CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { PhotoView, PhotoProvider } from "react-photo-view";
import Loading from "@/components/common/loading/loading";
import "react-photo-view/dist/react-photo-view.css";
type Props = {
  params: Promise<{ account: string; id: string }>; //动态路由 [account] 对应的参数
};
// PAGE 生活手记详情
const LifeStyles = (props: Props) => {
  const { params } = props;
  const { account, id } = React.use(params);
  const [lifeStyles, setLifeStyles] = useState<life_styles>({} as life_styles);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<Blogger>({} as Blogger);
  useEffect(() => {
    let mounted = true;

    // 初始化应用，检查用户状态 -> 获取文章数据
    const init = async () => {
      try {
        if (!mounted) return;
        // 然后获取文章数据
        await loadData();
      } catch (error) {
        //console.error("初始化应用时出错:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // 获取文章数据并关联作者信息
  const loadData = async () => {
    try {
      //console.log("api: get-lifestyles-detail");
      const response = await fetch(
        `/api/lifestyles/get-lifestyles-detail?blogger=${account}&id=${Number(id)}`
      );
      const result = await response.json();
      //console.log("api: /lifestyles/get-lifestyles-detail then", result, response);
      if (response.ok) {
        setLifeStyles(result.data);
        setUserInfo(result.bloggerInfo);
      } else {
        //console.error("获取文章时出错:", result.error);
      }
    } catch (error) {
      //console.error("获取文章时出错:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Loading></Loading>
    )
  }
  return (
    <div className="container w-[50%] m-auto">
      <div className="label-box anim-op-y">
        <div className="blogger-msg-box text-gray-400 gap-4 flex justify-center items-center pb-5">
          <div className="flex items-center gap-2 leading-15">
            <UserOutlined />
            <div>{userInfo?.user_name}</div>
          </div>
          <div className="flex items-center gap-2 leading-15">
            <CalendarOutlined />
            <div>{lifeStyles.created_at}</div>
          </div>
          {/* <div className='flex items-center gap-2 leading-15'>
          </div> */}
          {lifeStyles.labelIds?.map((item,index) => (
            <div className='flex items-center leading-15' key={'id_label_'+index+item.id}>
              <div className=''>#{item.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="m-auto">
        <div className="title text-xl text-bold anim-op-y">{lifeStyles.title}</div>
        <div className="excerpt text-gray-400 pt-4 pb-8 anim-op-y">
          {lifeStyles.excerpt}
        </div>
        <div className="album-box">
          {/* <div className="grid grid-cols-3 gap-3 w-full min-w-[400px] max-w-[500px]"> */}
          {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 w-full min-w-[400px] max-w-[500px]"> */}
          {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 w-full"> */}
          <div className="grid grid-cols-[repeat(3,minmax(0,160px))] gap-3 w-full">
            <PhotoProvider
              loop={true}
              maskOpacity={0.9}
            >
              {lifeStyles.photos &&
                lifeStyles.photos?.map((item) => (
                  <div className="anim-op-y" key={'id_photos_'+item.id}>
                    <div className="list anim-hover-scale-sm rounded-2xl box-shadow-reverse text-2xs  cursor-pointer">
                      <div className="album-box">
                        <div className="cover-box aspect-square relative">
                          <PhotoView src={item.url}>
                            <Image
                              loader={ImageLoader.cloudinary}
                              src={item.url + "?" + (Math.random()*10).toFixed(2) || ""}
                              alt=""
                              fill
                              sizes="160px"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </PhotoView>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </PhotoProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeStyles;
