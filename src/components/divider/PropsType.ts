import { BaseTypeProps } from "../utils";
import React from "react";

export type DividerType = "solid" | "dashed" | "dotted";
export type DividerAlign = "left" | "center" | "right";

export interface DividerProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 线条样式 */
  type?: DividerType;
  /**
   * 内容对齐位置
   * @default 'center'
   */
  align?: DividerAlign;
  /** 线条颜色 */
  lineColor?: string;
  /**
   * 文本
   * 业务内建议使用children代替
   * */
  text?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 文本大小 */
  textSize?: number | string;
  /** 文本是否粗体 */
  textBold?: boolean;
  /** 是否短线条 */
  inline?: boolean;
  /** 是否使用 0.5px 线 */
  hairline?: boolean;
}
