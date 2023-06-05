import React from "react";
import { BaseTypeProps } from "../utils";

export type LoadingType = "circular" | "spinner" | "ball" | "well";

export interface LoadingProps extends BaseTypeProps {
  children?: React.ReactNode
  /** 类型 */
  type?: LoadingType;
  /**
   * 加载图标大小，默认单位为 px
   * @default '30px'
   */
  size?: string | number;
  /**
   * 颜色
   * @default '#c9c9c9'
   */
  color?: string;
  /** 是否垂直排列图标和文字内容	 */
  vertical?: boolean;
  /**
   * 加载文本
   * 业务内建议使用children代替
   * */
  text?: string;
  /** 文字大小，默认单位为 px	 */
  textSize?: string | number;
  /**
   * 文字颜色
   * @default '#c9c9c9'
   */
  textColor?: string;
}
