import React, { CSSProperties } from "react";
import { BaseTypeProps } from "../utils";

export type StepsDirection = "horizontal" | "vertical";

export interface StepsProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 当前步骤图标颜色 */
  activeCheckColor?: string;
  /** 当前步骤和已完成步骤的颜色 */
  activeColor?: string;
  /** 未激活步骤的颜色 */
  inactiveColor?: string;
  /** 当前步骤对应的索引值 */
  active?: number;
  /** 非当前步骤对应的底部图标	 */
  inactiveIcon?: React.ReactNode;
  /** 当前步骤对应的底部图标 */
  activeIcon?: React.ReactNode;
  /** 已完成步骤对应的底部图标，优先级高于 inactive-icon */
  finishIcon?: React.ReactNode;
  /** 步骤条方向 */
  direction?: StepsDirection;
  /** 文字图标上下位置相反，direction="horizontal" 时有效 */
  reverse?: boolean;
  /** 点击步骤的标题或图标时触发 */
  onClickStep?: (index: number) => void;
}

export interface StepsItemProps extends BaseTypeProps {
  children?: React.ReactNode;
  parent?: StepsProps;
  index?: number;
  total?: number;
  /** 额外样式 */
  contentStyle?: CSSProperties;
  /** 步骤标题文本 */
  title?: string;
  /** 步骤标题文本额外样式 */
  titleStyle?: CSSProperties;
  /** 日期文本 */
  time?: string;
  /** 日期文本额外样式 */
  timeStyle?: CSSProperties;
  /** 描述文本 */
  desc?: string;
  /** 描述文本额外样式 */
  descStyle?: CSSProperties;
  /** 非当前步骤对应的底部图标	 */
  inactiveIcon?: string | React.ReactNode;
  /** 当前步骤对应的底部图标 */
  activeIcon?: string | React.ReactNode;
  /** 已完成步骤对应的底部图标，优先级高于 inactive-icon */
  finishIcon?: string | React.ReactNode;
}
