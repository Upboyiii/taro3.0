import React from "react";
import { BaseTypeProps } from "../utils";

export type labelPosition  = "left" | "right";
export type iconType  = "default" | "check";
export type CellAlign  = "start" | "center" | "end";

export interface OwlCheckboxProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 大小 */
  size?: number;
  /** 样式 */
  type?: iconType;
  /** 单元格对齐方式 默认居中 */
  align?: CellAlign;
  /** 图标额外样式 */
  iconStyle?: React.CSSProperties;
  /** 默认颜色 */
  defaultColor?: string;
  /** 选中颜色 */
  color?: string;
  /**  内容额外样式	*/
  contentStyle?: React.CSSProperties;
  /** 文案	*/
  label?: React.ReactNode;
  /**  文案额外样式	*/
  labelStyle?: React.CSSProperties;
  /**  文案位置	*/
  labelPosition?: labelPosition;
  /** 描述	*/
  desc?: React.ReactNode;
  /**  描述额外样式	*/
  descStyle?: React.CSSProperties;
  /** 右侧额外信息	*/
  right?: React.ReactNode;
  /**  右侧额外信息额外样式	*/
  rightStyle?: React.CSSProperties;
  /** 是否选中 */
  checked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 半选状态 */
  indeterminate?: boolean;
  /** 是否显示内边框 */
  border?: boolean;
  /** 内边框额外样式 */
  borderStyle?: React.CSSProperties;
  /** 是否单元格样式显示 */
  cell?: boolean;
  onChange?: (val)=>void;
}
