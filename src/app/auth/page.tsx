import { Suspense } from 'react';
// 导入抽离后的客户端组件（路径根据实际结构调整）
import Auth from './auth';

// 预加载占位组件（提升用户体验）
const AuthLoading = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600">加载中...</p>
  </div>
);

// PAGE 登录页（服务器组件，包裹Suspense）
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <Auth />
    </Suspense>
  );
}