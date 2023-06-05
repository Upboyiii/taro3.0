import { BaseTypeProps } from "../utils";
import React from "react";

export type TagType = "default" | "primary" | "success" | "info" | "warning" | "error";
export type TagSize = "small" | "large" | "mini";

export interface TagProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 类型 */
  type?: TagType;
  /** 大小 */
  size?: TagSize;
  /** 背景和边框颜色 */
  color?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 是否都空心 */
  plain?: boolean;
  /** 深底色白字 */
  dark?: boolean;
  /** 是否圆角 */
  round?: boolean;
  /** 是否mark标记 */
  mark?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示关闭图标 */
  closeable?: boolean;
  /** 是否显示 */
  show?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}
