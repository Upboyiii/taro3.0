import React from "react";
import { BaseTypeProps } from "../utils";

export type PopupPosition = "top" | "bottom" | "center" | "full" | "pageSheet" ;
export type PopupClosePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type PopupTitleAlign = "left" | "center";

export interface PopupProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 打开弹出框 */
  show: boolean;
  /** 动画时长，单位毫秒 */
  duration?: number;
  /** z-index 层级 */
  zIndex?: number;
  /** 弹出位置 */
  position?: PopupPosition;
  /** 是否显示遮罩层	 */
  overlay?: boolean;
  /** 点击遮罩层是否可以关闭Popup */
  overlayClickable?: boolean;
  /** 自定义遮罩层样式 */
  overlayStyle?: React.CSSProperties;
  /** 是否圆角 */
  round?: boolean;
  /** 自定义弹出层样式 */
  customStyle?: React.CSSProperties;
  /** 弹出层背景颜色 */
  bgColor?: string
  /** 头部对齐方式 */
  headerAlign?: PopupTitleAlign;
  /** 头部对齐方式 */
  headerStyle?: React.CSSProperties;
  /** 头部操作区域是否显示border */
  headerBorder?: boolean;
  /** 标题文本 */
  title?: string | React.ReactNode;
  /** 标题额外样式 */
  titleStyle?: React.CSSProperties;
  /** 描述文本 */
  desc?: string | React.ReactNode;
  /** 描述额外样式 */
  descStyle?: React.CSSProperties;
  /** 是否显示拖拉图标，仅position='pageSheet'显示 */
  drag?: boolean;
  /** 是否显示关闭图标 */
  closeable?: boolean;
  /** 关闭图标位置 */
  closePosition?: PopupClosePosition;
  /** 关闭图标额外样式 */
  closeStyle?: React.CSSProperties;
  /** 头部下方内容 */
  tabs?: React.ReactNode;
  /** body额外样式 */
  bodyStyle?: React.CSSProperties;
  /** body是否卡片形式 */
  bodyCard?: boolean;
  /** 弹出窗内容区域最小高度 */
  minHeight?: number;
  /** 弹出窗内容区域最大高度 */
  maxHeight?: number;
  /** 底部提示区域 */
  tips?: any;
  /** 底部提示区域额外样式 */
  tipsStyle?: React.CSSProperties;
  /** 底部操作区域 */
  action?: any;
  /** 底部操作区域额外样式 */
  actionStyle?: React.CSSProperties;
  /** 底部操作区域类名 */
  actionClass?: any;
  /** 底部操作区域是否显示border */
  actionBorder?: boolean;
  /** 是否有滚动 */
  scroll?: boolean;
  /** 点击关闭图标时触发	 */
  onClose?: () => void;
}
