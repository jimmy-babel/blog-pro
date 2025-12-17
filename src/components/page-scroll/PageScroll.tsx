import React, { useEffect, useCallback, useRef } from "react";
type Props = {
  listElement: React.ReactNode;
  isEmpty?: boolean;
  onScrollEnd?: () => void; // 滚动到底部的回调函数
};

const PageScroll = (props: Props) => {
  const { listElement, isEmpty, onScrollEnd } = props;
  // 创建节流函数
  const throttle = useCallback((func: Function, delay: number) => {
    let inThrottle: boolean = false;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          func.apply(this, args);
          inThrottle = false;
        }, delay);
      }
    };
  }, []);

  // 监听页面滚动触底
  useEffect(() => {
    let inBottom = false;
    // 定义滚动处理函数
    const handleScroll = () => {
      // 获取当前滚动位置
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // 获取窗口高度
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // 获取文档总高度
      const documentHeight = document.documentElement.scrollHeight;

      // 设置触底阈值（这里设置为距离底部50px时触发）
      const threshold = 50;
      console.log("滚动 滚动位置 window.pageYOffset", window.pageYOffset);
      console.log("滚动 视口高度 window.innerHeight", windowHeight);
      console.log(
        "滚动 文档总高度 document.documentElement.scrollHeight",
        documentHeight
      );
      // 判断是否触底
      if (scrollTop + windowHeight >= documentHeight - threshold) {
        if (!inBottom) {
          // 避免重复触发触底
          console.log("触底", window, document.documentElement, document);
          inBottom = true;
          // 触发回调函数（如果有）
          if (onScrollEnd) {
            onScrollEnd();
          }
        }
      } else {
        // console.log('未触底');
        inBottom = false;
      }
    };

    // 创建节流后的滚动处理函数（200ms触发一次）
    const throttledHandleScroll = throttle(handleScroll, 50);

    // 添加滚动事件监听
    window.addEventListener("scroll", throttledHandleScroll);

    // 清理函数
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [onScrollEnd, throttle]);

  return (
    <div className='w-full anim-op-y'>
      {isEmpty ? (
        <div className="text-center text-xl pt-50 opacity-60">暂无数据</div>
      ) : (
        listElement
      )}
    </div>
  )
};

export default PageScroll;
