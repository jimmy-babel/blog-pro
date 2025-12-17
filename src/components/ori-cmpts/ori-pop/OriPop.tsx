import React, { useState, useEffect, useCallback, useRef } from 'react';
import './OriPop.scss';

type Props = {
  
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onClose: () => void;
  // backgroundColor?: string,
  maskBackgroundColor?: string,
  isMaskClick?: boolean,
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'center',
  timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out',
  // isShowClose?: boolean,
  customPopupStyle?: React.CSSProperties,
  offset?: number, 
  isShowTitle?: boolean,
  titleSlot?: React.ReactNode, // 对应原命名插槽 title
  children?: React.ReactNode, // 对应原默认插槽



}

const OriPop = (props: Props) => {
  // 解构 props，设置默认值（对应原 Uniapp 的 props 默认值）
  const {
    visible,
    onVisibleChange,
    onClose,
    isMaskClick = true,
    placement = '',
    timing = 'linear',
    maskBackgroundColor = 'rgba(0, 0, 0, 0.4)',
    customPopupStyle = {},
    // isShowClose,
    offset = 0,
    isShowTitle,
    titleSlot,
    children,
  } = props;

  // 状态管理（替代原 Uniapp 的 data）
  const [showPopup, setShowPopup] = useState(visible);
  const [maskOpacity, setMaskOpacity] = useState(0);
  const [popupStyle, setPopupStyle] = useState({
    transition: `all ${200}ms ${timing}`,
    transform: '',
    opacity: 0
  });
  const initedRef = useRef(false);
  const animationTimer = useRef<NodeJS.Timeout | null>(null); 

  // 转换 rpx 到 px（Uniapp 特有的 rpx 适配）

  // 初始化动画样式（对应原 initAnimate 方法）
  const initAnimate = useCallback((isShow: boolean) => {
    const offsetPx = offset;
    let transform = '';
    let opacity = 1;

    switch (placement) {
      case 'left':
        transform = `translateX(${isShow ? offsetPx : -100}%)`;
        break;
      case 'right':
        transform = `translateX(${isShow ? -offsetPx : 100}%)`;
        break;
      case 'top':
        transform = `translateY(${isShow ? offsetPx : -100}%)`;
        break;
      case 'bottom':
        transform = `translateY(${isShow ? -offsetPx : 100}%)`;
        break;
      case 'center':
        transform = `translate(-50%, -50%) scale(${isShow ? 1 : 0.5})`;
        opacity = isShow ? 1 : 0;
        break;
      default:
        // transform = `translateY(${isShow ? -offsetPx : 100}%)`;
        break;
    }
    console.log('initAnimate', transform, opacity);

    setPopupStyle({
      transition: `all ${200}ms ${timing}`,
      transform,
      opacity
    });
    setMaskOpacity(isShow ? 1 : 0);
  }, [placement, offset, timing]);

  // 显示弹窗（对应原 show 方法）
  const show = useCallback(() => {
    setShowPopup(true);
    // 下一帧执行动画（对应原 $nextTick）
    // requestAnimationFrame(() => {
    //   initAnimate(true);
    // });
    if(!initedRef.current){
      initAnimate(false);
      initedRef.current = true;
    }
    setTimeout(() => {
      initAnimate(true);
    }, 50);
    onVisibleChange && onVisibleChange(true);
  }, [initAnimate, onVisibleChange]);

  // 隐藏弹窗（对应原 dismiss 方法）
  const dismiss = useCallback(() => {
    initAnimate(false);
    // 动画结束后隐藏 DOM（对应原 setTimeout）
    animationTimer.current = setTimeout(() => {
      setShowPopup(false);
      onVisibleChange && onVisibleChange(false);
    }, 200);
  }, [initAnimate, onVisibleChange]);

  // 点击遮罩（对应原 clickMask 方法）
  const clickMask = useCallback(() => {
    if (isMaskClick) {
      dismiss();
      onClose && onClose();
    }
  }, [isMaskClick, dismiss, onClose]);

  // 监听 visible 变化（对应原 watch modelValue）
  useEffect(() => {
    console.log('watch modelValue', visible, showPopup);
    if (visible !== showPopup) {
      visible ? show() : dismiss();
    }
  }, [visible, showPopup, show, dismiss]);

  // 组件卸载时清除定时器（防止内存泄漏）
  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, []);

  // 组合弹窗 className
  const getPopupClassName = () => {
    const baseClass = 'popup';
    const bgClass = 'popup-bg-color';
    // const borderClass = 'popup-border';
    // const bgClass = customBg ? '' : 'popup-bg-color';
    // const borderClass = customBorder ? '' : 'popup-border';
    return `${baseClass} ${bgClass}`;
  };

  // 遮罩样式
  const maskStyle = {
    backgroundColor: maskBackgroundColor,
    opacity: maskOpacity,
    transition: `opacity ${200}ms ${timing}`
  };

  // 根容器样式（传递 offset 变量）
  const rootStyle = {
    '--popup-offset': `${offset}px`
  };

  if (!showPopup) return null;

  return (
    <div 
      className={`ori-pop-scoped ori-popup ${placement}-popup`}
      style={{...rootStyle, ...customPopupStyle}}
    >
      {/* 遮罩层 */}
      <div 
        className="mask bg-color-mask"
        style={maskStyle}
        onClick={clickMask}
      ></div>
      
      {/* 弹窗主体 */}
      <div 
        className={getPopupClassName()}
        style={{ ...popupStyle, ...customPopupStyle }}
      >
        {/* 标题栏（对应原 isShowTitle） */}
        {isShowTitle && (
          <div className="popup-title flex-b-c f-shrink-0">
            <div className="flex-1 bold p-20 text-c">
              {titleSlot}
            </div>
          </div>
        )}
        
        {/* 弹窗内容区 */}
        <div className="popup-cont">
          <div className="popup-cont-inner text-c">
            {/* {loading ? <div className="content-loading">加载中...</div> : children} */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriPop;
