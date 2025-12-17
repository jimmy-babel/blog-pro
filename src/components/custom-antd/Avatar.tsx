import React from 'react';
// import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

type Props = {
  size?:number | 'large' | 'small',
  shape?:"circle" | "square",
}
const App: React.FC<Props> = (props:Props) => {
  const {size="default",shape="circle"} = props;
  return <Avatar size={size} shape={shape} src="/jimmy.jpeg" />
}

export default App;