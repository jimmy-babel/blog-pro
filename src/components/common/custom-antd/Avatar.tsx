import React, { useEffect, useState } from 'react';
// import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { Blogger } from '@/lib/supabase';

type Props = {
  size?:number | 'large' | 'small',
  shape?:"circle" | "square",
  src?:string,
  blogger?:string,
}
const App: React.FC<Props> = (props:Props) => {
  const {size="default",shape="circle",src,blogger} = props;
  const [bloggerInfo, setBloggerInfo] = useState<Blogger>({} as Blogger);
  const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
      if(blogger){
        getDetail();
      }
    }, [blogger]);
    async function getDetail(){
      try{
        setLoading(true);
        const res = await fetch(
          `/api/blogger/get-blogger-info?blogger=${blogger}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        setLoading(false);
        // console.log('avatar fetch bloggerInfo:', data);
        setBloggerInfo((data?.data || {}) as Blogger);
      }catch(error){
        // console.log('avatar fetch bloggerInfo error:', error);
        setLoading(false);
      }
    }
  return <Avatar size={size} shape={shape} src={src || bloggerInfo?.avatar_url || (!loading&&"/avatar.png") || ""} />
}

export default App;