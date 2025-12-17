// app/components/ServerNav.tsx
import ClientNav from '@/components/nav';

// 静态导航列表（服务端预定义，无需客户端计算）
const staticNavList = [
  { key: "home", name: "首页", url: `web` },
  { key: "articles", name: "文章", url: `web/articles` },
  { key: "lifestyles", name: "生活手记", url: `web/lifestyles` },
  // { key: "askai", name: "问AI", url: `web/askai` },
  // { key: "message", name: "留言", url: `web/message` },
  
  // { key: "auth", name: "登录", url: `/blog/auth`, type: "from" },
  // { key: "admin", name: "后台管理", url: `admin` },
];

type Props = {
  isPlace?: boolean;
  account?: string;
};

// 服务端组件：只处理静态内容，传递给客户端组件
export default function ServerNav({ isPlace, account }: Props) {
  return (
    <ClientNav 
      navList={staticNavList} 
      isPlace={isPlace} 
      account={account} 
    />
  );
}