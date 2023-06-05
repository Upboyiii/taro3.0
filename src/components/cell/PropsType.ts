import React from "react";
import { BaseTypeProps } from "../utils";

export type CellArrowDirection = "up" | "down" | "left" | "right";
export type CellSize = "small" | "large";
export type CellAlign  = "start" | "center" | "end";
export type CellContentAlign  = "left" | "center" | "right";

export interface CellProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 自定义左侧图标 */
  icon?: React.ReactNode;
  /** 左侧图标大小 */
  iconSize?: number;
  /** 左侧图标是否圆形 */
  iconRound?: boolean;
  /** 左侧图标额外样式 */
  iconStyle?: React.CSSProperties;
  /** 左侧图标额外类名	 */
  iconClass?: string;
  /** 左侧标题	*/
  title?: React.ReactNode;
  /** 左侧标题额外样式	*/
  titleStyle?: React.CSSProperties;
  /** 左侧标题额外类名	*/
  titleClass?: string;
  /** 左侧标题文本额外样式	*/
  textStyle?: React.CSSProperties;
  /**  标题下方的描述信息	*/
  label?: React.ReactNode;
  /**  描述信息额外样式	*/
  labelStyle?: React.CSSProperties;
  /**  描述信息额外类名	*/
  labelClass?: string;
  /** 内容 */
  content?: number | string | React.ReactNode;
  /** 内容对齐方式 */
  contentAlign?: CellContentAlign;
  /** 内容额外样式 */
  contentStyle?: React.CSSProperties;
  /** 内容额外类名 */
  contentClass?: string;
  /** 右侧额外内容	 */
  extra?: React.ReactNode;
  /** 右侧额外内容额外样式 */
  extraStyle?: React.CSSProperties;
  /** 右侧额外内容额外类名 */
  extraClass?: string;
  /** 是否显示右测箭头 */
  arrow?: boolean;
  /** 右测箭头方向 */
  arrowDirection?: CellArrowDirection;
  /** 右侧自定义图标 */
  rightIcon?: React.ReactNode;
  /** 右侧图标额外样式 */
  rightStyle?: React.CSSProperties;
  /** 右侧图标额外类名 */
  rightClass?: string;
  /** 单元格对齐方式 默认居中 */
  align?: CellAlign;
  /** 单元格大小 */
  size?: CellSize;
  /** 不需要内边距 */
  compact?: boolean;
  /** 是否显示内边框 */
  border?: boolean;
  /** 内边框额外样式 */
  borderStyle?: React.CSSProperties;
  /** 是否分割线样式显示  */
  divider?: boolean;
  /** 是否开启点击反馈 */
  clickable?: boolean;
  /** 是否展示右侧箭头并开启点击反馈	 */
  onRight?: ()=>void;
  onClick?: ()=>void;
}
