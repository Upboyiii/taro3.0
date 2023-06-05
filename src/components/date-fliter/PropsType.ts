import { BaseTypeProps } from "../utils";
import React from "react";

export type DateFilterType = "day" | "month" | "year";

export interface DateFilterProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 默认值 */
  value: string;
  /* 描述 */
  desc?: React.ReactNode;
  /** 类型 */
  type?: DateFilterType;
  /* 是否显示前一日（月，年） */
  showPrev?: boolean;
  /* 是否显示后一日（月，年） */
  showNext?: boolean;
  /* 是否禁用前一日（月，年） */
  disabledPrev?: boolean;
  /* 是否禁用后一日（月，年） */
  disabledNext?: boolean;
  /** 背景颜色 */
  bgColor?: string;
  /** 是否有下边框 */
  border?: boolean;
  onChange?: (value: string) => void;
  onClick?: () => void;
}
