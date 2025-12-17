import { AccountProvider } from "@/contexts/AccountContext";
type Props = {
  params:Promise<{account:string}>,
  children:React.ReactNode
}
// 服务端布局：解析params并传递给Provider
export default async function AccountLayout({
  children,
  params,
} : Props
) 
{
  const { account } = await params; // 服务端直接获取路由参数
  return (
    // 客户端Provider：将account注入Context
    <AccountProvider account={account}>
      {children} {/* 子页面/组件会被包裹，可访问account */}
    </AccountProvider>
  );
}