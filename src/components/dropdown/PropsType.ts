import React from "react";
import { BaseTypeProps } from "../utils";

export type borderType = "top" | "bottom" | "top-bottom";

export interface DropdownOptionItem {
  label: string;
  value: string | number;
}

export interface DropdownProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 是否横向滚动 */
  scroll?: boolean;
  /** 前缀内容 */
  prefix?: React.ReactNode;
  /** 后缀内容 */
  suffix?: React.ReactNode;
  /** 是否禁用菜单 */
  disabled?: boolean;
  /** 是否显示内边框 */
  border?: borderType | boolean;
  /** 菜单栏 z-index 层级 */
  zIndex?: number;
  /** 是否显示遮罩层 */
  overlay?: boolean;
  /** 弹出曾高度 */
  height?: number;
  /** 是否在点击外部元素后关闭菜单 */
  closeOnClickOverlay?: boolean;
}

export interface DropdownMenuProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 选项数组 */
  options: any[];
  /** 菜单标题  */
  title?: string | React.ReactNode;
  /** 是都选中文本的替换标题  */
  titleAlter?: boolean;
  /** 菜单选中项对应的 value key */
  menuValue?: any;
  /** 当前选中项对应的 value key */
  value?: any;
  /** 是否禁用菜单 */
  disabled?: boolean;
  /* format */
  format?: {
    /** 名称的下标 默认"label" */
    label: string;
    /** 值的下标 默认"value" */
    value: string;
  };
  /** 设置一行展示多少列 */
  columns?: number;
  /** 弹出曾高度 */
  itemHeight?: number;
  /** 是否有二级目录 */
  hasChildren?: boolean;
  /** 是否需要滚动条 */
  scroll?: boolean;
  onChange?: (values: any) => void;
  onMenuChange?: (values: any) => void;
  onClick?: () => void;
}
