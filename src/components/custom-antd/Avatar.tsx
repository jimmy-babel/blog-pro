import React from 'react';
// import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

type Props = {
  size?:number | 'large' | 'small',
  shape?:"circle" | "square",
}
const App: React.FC<Props> = (props:Props) => {
  const {size="default",shape="circle"} = props;
  return <Avatar size={size} shape={shape} src="http://devimgtest.innourl.com/SAAS_IMAGE/images/INNOVATION/user/avatar/20251011/20251011174558588_1883131.jpeg" />
}

export default App;