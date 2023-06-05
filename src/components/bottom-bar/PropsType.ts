import { BaseTypeProps } from "../utils";
import React, { CSSProperties } from "react";

export type direction = "row" | "column";

export interface BottomBarProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 类型 */
  direction?: direction;
  /** 是否显示内边框 */
  border?: boolean;
  /** 内边框额外样式 */
  borderStyle?: CSSProperties;
  /** 背景和边框颜色 */
  bgColor?: string;
  /** 底部安全区域 */
  safeAreaBottom?: boolean;
}
