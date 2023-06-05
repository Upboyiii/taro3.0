import React, { CSSProperties } from "react";
import { BaseTypeProps } from "../utils";

export interface NavBarProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 背景是否透明 */
  transparent?: boolean;
  /** 是否显示下方边框 */
  border?: boolean;
  /** 边框额外样式	 */
  borderStyle?: CSSProperties;
  /** 透明度 */
  opacity?: number;
  /* 顶部安全区域 */
  safeAreaInsetTop?: boolean;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色	 */
  bgColor?: string;
  /** 是否显示左侧箭头	 */
  leftArrow?: boolean;
  /** 左侧文本	 */
  leftText?: string | React.ReactNode;
  /** 标题文本 */
  title?: React.ReactNode;
  /** 标题文本额外样式	 */
  titleStyle?: CSSProperties;
  /** 右侧内容 */
  right?: React.ReactNode;
  /** 右侧内容额外样式	 */
  rightStyle?: CSSProperties;
  onClickTitle?: () => void;
  onClickBack?: () => void;
  onClickRight?: () => void;
}
