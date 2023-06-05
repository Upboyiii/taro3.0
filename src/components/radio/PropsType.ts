import React from "react";
import { BaseTypeProps } from "../utils";

export type labelPosition  = "left" | "right";
export type iconType  = "default" | "dot" | "check" | "button";
export type iconSize  = "small" | "large";

export interface OwlRadioProps extends BaseTypeProps {
  value?: string | number | boolean;
  children?: React.ReactNode;
  /** 大小 */
  size?: number | iconSize;
  /** 样式 */
  type?: iconType;
  /** 图标额外样式 */
  iconStyle?: React.CSSProperties;
  /** 默认颜色 */
  defaultColor?: string;
  /** 选中颜色 */
  color?: string;
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
  /** 是否简洁 (没有圆形边框，只有一个勾) */
  simple?: boolean;
  /** 是否选中 */
  checked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示内边框 */
  border?: boolean;
  /** 内边框额外样式 */
  borderStyle?: React.CSSProperties;
  /** 是否单元格样式显示 */
  cell?: boolean;
  /** 是否圆角 props.type='button' 有效 */
  round?: boolean;
  /** 是否空心的 props.type='button' 有效 */
  plain?: boolean;
  onChange?: (val)=>void;
  onClick?: ()=>void;
}
