import { BaseTypeProps } from "../../utils";
import React, { CSSProperties } from "react";

export interface EchartsPieOption {
  value: number | string;
  color: string;
  borderRadius?: number;
}

export interface EchartsPieProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** pie 数据 */
  options: EchartsPieOption[];
  /** pie 大小 */
  size?: number;
  /** 是否空心圆 */
  plain?: boolean;
  /** 线条宽度大小 */
  borderWidth?: number;
  /** 线条是否圆角 */
  borderRadius?: boolean;
  /** 标题 */
  title?: React.ReactNode;
  /** 标题额外样式 */
  titleStyle?: CSSProperties;
  /** 文本 */
  text?: React.ReactNode;
  /** 文本额外样式 */
  textStyle?: CSSProperties;
  /** 描述 */
  desc?: React.ReactNode;
  /** 描述额外样式 */
  descStyle?: CSSProperties;
}
