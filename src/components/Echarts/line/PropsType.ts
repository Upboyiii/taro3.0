import { BaseTypeProps } from "../../utils";
import React from "react";

export interface EchartsLineOption {
  data: any[];
  color?: string;
  name?: string;
}

export interface EchartsLabelOption {
  data: any[];
  interval?: number;
  rotate?: string;
}

export interface EchartsLineProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 数据 */
  options: EchartsLineOption[];
  /** 描述 */
  label: EchartsLabelOption;
  /** 高度 */
  height?: number;
  /** 线条宽度大小 */
  borderWidth?: number;
  /** 线条是否圆角 */
  borderRadius?: boolean;
}
