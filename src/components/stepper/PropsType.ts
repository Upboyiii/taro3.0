import { BaseTypeProps } from "../utils";
import React from "react";

export type StepperTheme = "default" | "tinge";
export type StepperSize = "small" | "large";

export interface StepperProps extends BaseTypeProps {
  /** 标识符，可以在 onChange 事件回调参数中获取	 */
  name?: number | string;
  /** 当前输入的值  */
  value?: number | string;
  /** 样式风格，可选值为 `ting`  */
  theme?: StepperTheme;
  /** 样式大小  */
  size?: StepperSize;
  /** 是否空心 */
  plain?: boolean;
  /** 是否圆角 */
  round?: boolean;
  /** 是否允许输入的值为空	 */
  allowEmpty?: boolean;
  /** 输入框宽度，默认单位为 px	 */
  inputWidth?: number;
  /** 输入框额外类	 */
  inputClass?: string;
  /** 按钮大小以及输入框高度，默认单位为 px	 */
  buttonSize?: number;
  /** 按钮额外类	 */
  buttonClass?: string;
  /** 减少按钮额外类	 */
  buttonMinusClass?: string;
  /** 增加按钮额外类	 */
  buttonPlusClass?: string;
  /** 按钮显眼色	 */
  buttonPrimary?: boolean
  /** 增加按钮显眼色	 */
  buttonPlusPrimary?: boolean;
  /** 输入框占位提示文字	 */
  placeholder?: string;
  /** 是否禁用步进器 */
  disabled?: boolean;
  /** 是否禁用增加按钮	 */
  disablePlus?: boolean;
  /** 是否禁用减少按钮	 */
  disableMinus?: boolean;
  /** 是否禁用输入框	*/
  disableInput?: boolean;
  /** 是否禁用输入框 */
  readonlyInput?: boolean;
  /** 是否显示增加按钮	 */
  showPlus?: boolean;
  /** 是否显示减少按钮	 */
  showMinus?: boolean;
  /** 是否显示输入框	 */
  showInput?: boolean;
  /** 是否只允许输入整数  */
  integer?: boolean;
  /** 固定显示的小数位数  */
  decimalLength?: number;
  /** 最小值	 */
  min?:  number;
  /** 最大值	 */
  max?: number;
  /** 步长，每次点击时改变的值	 */
  step?: number;
  /** 输入框点击事件 */
  onClick?: () => void;
  /** 当绑定值变化时触发的事件	 */
  onChange?: (val: string | number) => void;
  /** 点击增加按钮时触发	 */
  onPlus?: (val: string | number, event: React.MouseEvent) => void;
  /** 点击减少按钮时触发	 */
  onMinus?: (val: string | number, event: React.MouseEvent) => void;
  /** 点击不可用的按钮时触发	 */
  onOverlimit?: (actinType: string) => void;
}
