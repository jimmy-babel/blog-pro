import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  screenPage?: boolean;
  pageScroll?: boolean;
  min100VH?: boolean;
  screenVH?:boolean;
  safeArea?: boolean;
  direction?:String;
  extraClass?: string;
  boxStyle?: React.CSSProperties;
}

export default function SetLayout({
  children,
  header,
  footer,
  screenPage = false,
  pageScroll = false,
  safeArea = false,
  min100VH = false,
  screenVH = false,
  boxStyle,
  extraClass = "",
  direction = "vertical",
}: RootLayoutProps) {
  return (
    <div
      className={`
        flex
        ${direction == 'vertical' ? "flex-col w-full m-auto" : ""}
        ${screenVH ? 'min-h-screen' : ''}
        ${min100VH ? "min-h-[100vh]" : "min-h-[inherit]"}
        ${extraClass}
      `}
      style={boxStyle}
    >
      {header && (
        <div
          className={`shrink-0 sticky z-[1] left-0 top-0 ${direction == 'vertical' ? "w-full" : ""}`}
        >
          {header}
        </div>
      )}

      {/* <div className={`flex-1 ${direction == 'vertical' ? "w-full" : ""} ${screenPage?'overflow-y-scroll':''}`}>{children}</div> */}
      <div className={`flex-1 ${direction == 'vertical' ? "w-full" : ""}`}>{children}</div>

      {footer && (
        <div
          className={`
          shrink-0 ${direction == 'vertical' ? "w-full" : ""} 
          ${pageScroll ? "sticky left-0 bottom-0" : ""}
          ${safeArea ? "safe-area" : ""}
        `}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
