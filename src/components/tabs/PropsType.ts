import { BaseTypeProps } from "../utils";
import React from "react";

export type TabsType = "line" | "pill";
export type TabsAlign = "left" | "center" | "right";
export type borderType = "top" | "bottom" | "top-bottom";

export interface TabsProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 选中的数据 */
  active: number | string;
  /** tabs数据 */
  options: any[];
  /* format */
  format?: {
    /** 名称的下标 默认"label" */
    label: string;
    /** 值的下标 默认"value" */
    value: string;
  };
  /** 类型 */
  type?: TabsType;
  /** 背景颜色 */
  bgColor?: string;
  /** 文字颜色 */
  color?: string;
  /** 选中文字颜色 */
  activeColor?: string;
  /** 选中文字背景颜色颜色 props.type === "pill" 有效 */
  activeBgColor?: string;
  /** 对齐方式, props.type === "line" 有效 */
  align?: TabsAlign;
  /** 标签间隙 props.type === "line" 有效 */
  space?: number;
  /** 是否需要分割线 props.type === "line" 有效 */
  divider?: boolean;
  /** 是否滚动操作 */
  scroll?: boolean;
  /** 是否有下边框 */
  border?: boolean | borderType;
  onChange?: (value) => void;
}
