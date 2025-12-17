import SetLayout from "@/components/set-layout";
import Nav from "@/app/blog/[account]/admin/components/nav"
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const extraClass = `h-[100%] max-md:min-w-[500px]`;
  return (
    <div className="h-[calc(100vh-var(--nav-bar-height))] overflow-hidden global-parse-light">
      <SetLayout header={<Nav></Nav>} extraClass={extraClass} screenPage direction="level" safeArea>
        <div className="admin-layout-bg pt-3 pl-3 box-border bg-[#f4f4f4] w-full h-full">
          <div className="admin-layout-content bg-white w-full h-full relative">
            {children}
          </div>
        </div>
      </SetLayout>
    </div>
  );
}
