import React from 'react';
import Image from 'next/image';
import { Card } from "antd";
import './profile.css'; // 导入自定义样式
type Props = {
  extraClass?:String,
}

const Profile = (props: Props) => {
  const {extraClass = ""} = props;
  // 名字、头像、简介
  const avatarUrl = ""
  const userName = "CURRY";
  const date = new Date();
  const tips = `2025-10-8 ~ ${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()}`;
  return (
    <Card className={`w-full rounded-[12px] overflow-hidden shadow-gray-400 no-pointer ${extraClass}`} variant="borderless" hoverable>
      <div className='w-full flex flex-col justify-center items-center min-h-[300px]' style={{background:"linear-gradient(-45deg,#e8d8b9,#eccec5,#a3e9eb,#bdbdf0,#eec1ea)"}}>
        <div>
          <Image className='rounded-[50%] w-[110px] h-[110px]' src={avatarUrl} alt="USER" objectFit="contain" width={110} height={110} />
        </div>
        <div className='flex flex-col justify-center items-center'>
          <div className='font-bold text-2xl leading-16'>{userName}</div>
          <div>{tips}</div>
        </div>
      </div>
    </Card>
  )
}
export default Profile