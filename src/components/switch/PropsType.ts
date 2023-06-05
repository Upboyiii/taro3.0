import { BaseTypeProps } from "../utils";
import React from "react";

export type SwitchSize = "large" | "small";


export interface OwlSwitchProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 开关尺寸	 */
  size?: SwitchSize;
  /** 是否为禁用状态	 */
  disabled?: boolean;
  /** 开关选中状态	 */
  checked?: boolean;
  /** 打开时的背景色	 */
  activeColor?: string;
  /** 关闭时的背景色	 */
  inactiveColor?: string;
  /** 打开时对应的值	 */
  activeValue?: number | string | boolean;
  /** 关闭时对应的值	 */
  inactiveValue?: number | string | boolean;
  /** 开关状态切换时触发	 */
  onChange?: (value: any) => void;
}
