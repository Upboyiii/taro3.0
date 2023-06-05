import React, { CSSProperties } from "react";
import { BaseTypeProps } from "../utils";
import { CommonEventFunction } from "@tarojs/components/types/common";
import { InputProps } from "@tarojs/components/types/Input";
import { TextareaProps } from "@tarojs/components/types/Textarea";

export type FieldSize = "small" | "large";
export type FieldAlign  = "start" | "center" | "end";
export type FieldType = "tel" | "text" | "number" | "idcard" | "digit" | "textarea" | "password" | "search";
export type FieldConfirmType = "send" | "search" | "next" | "go" | "done";
export type FieldTextAlign = "left" | "center" | "right";
export type FieldArrowDirection = "up" | "down" | "left" | "right";
export type FieldClearTrigger = "always" | "focus";
export type FieldFormatTrigger = "onBlur" | "onChange";
export type FieldIntroPosition = "top" | "bottom";
export type FieldErrorMessagePosition = "title" | "content";
export type FieldAutosizeConfig = {
  maxHeight?: number;
  minHeight?: number;
};

export interface FieldInputProps {
  /** input 的类型
   * @default "text"
   * @rn 部分支持
   */
  type?: FieldType;
  /** 是否是密码类型 */
  password?: boolean;
  /** 指定 placeholder 的文本颜色
   * @supported rn
   */
  placeholderTextColor?: string;
  /** 设置键盘右下角按钮的文字
   * @default done
   * @supported weapp, rn, tt
   */
  confirmType?: FieldConfirmType;
  /** 点击键盘右下角按钮时是否保持键盘不收起
   * @default false
   * @supported weapp
   */
  confirmHold?: boolean;
}

export interface FieldTextareaProps {
  /** 是否是多行文本 textarea 类型 */
  textarea?: boolean;
  /** 是否自适应内容高度，只对 textarea 有效，
   * 设置 autosize 时，style.height不生效
   * @supported weapp, rn, tt
   */
  autosize?: boolean | FieldAutosizeConfig;
  /** 如果 Textarea 是在一个 `position:fixed` 的区域，需要显示指定属性 fixed 为 true
   * @supported weapp
   */
  fixed?: boolean;
  /** 是否显示键盘上方带有”完成“按钮那一栏
   * @default true
   * @supported weapp, tt
   */
  showConfirmBar?: boolean;
  /** 是否去掉 iOS 下的默认内边距
   * @default false
   * @supported weapp, tt
   */
  disableDefaultPadding?: boolean;
  /** 输入框行数变化时调用，event.detail = {height: 0, heightRpx: 0, lineCount: 0}
   * @supported weapp, rn, tt
   */
  onLineChange?: CommonEventFunction<TextareaProps.onLineChangeEventDetail>;
}

export interface FieldCommonProps extends FieldInputProps, FieldTextareaProps {
  /** 名称，提交表单的标识符 */
  name?: string;
  /** 输入框的初始内容 */
  value?: any;
  /** 输入框为空时占位符 */
  placeholder?: string;
  /** 指定 placeholder 的样式
   * @supported weapp, rn, tt
   */
  placeholderStyle?: string;
  /** 指定 placeholder 的样式类
   * @default "input-placeholder"
   * @supported weapp, tt
   */
  placeholderClass?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大输入长度，设置为 -1 的时候不限制最大长度 */
  maxlength?: number;
  /** 自动聚焦，拉起键盘
   * @default false
   * @supported weapp, swan, qq, jd, h5
   */
  autoFocus?: boolean
  /** 获取焦点 */
  focus?: boolean;
  /** 是否自动增高，设置 autoHeight 时，style.height不生效
   * @default false
   * @supported weapp, alipay, swan, tt, qq, jd, rn
   */
  autoHeight?: boolean
  /** 指定光标与键盘的距离，单位 px 。取 input 距离底部的距离和 cursor-spacing 指定的距离的最小值作为光标与键盘的距离
   * @default 0
   * @supported weapp, tt
   */
  cursorSpacing?: number;
  /** 指定focus时的光标位置
   * @supported weapp, rn, tt
   */
  cursor?: number;
  /** 光标起始位置，自动聚集时有效，需与selection-end搭配使用
   * @default -1
   * @supported weapp, rn, tt
   */
  selectionStart?: number;
  /** 光标结束位置，自动聚集时有效，需与selection-start搭配使用
   * @default -1
   * @supported weapp, rn, tt
   */
  selectionEnd?: number;
  /** 键盘弹起时，是否自动上推页面
   * @default false
   * @supported weapp, tt
   */
  adjustPosition?: boolean;
  /** focus 时，点击页面的时候不收起键盘
   * @default false
   * @supported weapp
   */
  holdKeyboard?: boolean;
  /** 当键盘输入时，触发input事件，
   * event.detail = {value, cursor, keyCode}，
   * 处理函数可以直接 return 一个字符串，将替换输入框的内容。
   */
  // onChange?: CommonEventFunction<InputProps.inputEventDetail>;
  onChange?: Function;
  /** 输入框聚焦时触发，
   * event.detail = { value, height }，height 为键盘高度
   * */
  onFocus?: CommonEventFunction<InputProps.inputForceEventDetail>;
  /** 输入框失去焦点时触发
   * event.detail = {value: value}
   * */
  onBlur?: CommonEventFunction<InputProps.inputValueEventDetail>;
  /** 点击完成按钮时触发
   * event.detail = {value: value}
   * @supported weapp, rn, tt
   * @h5 借用[Form 组件](./form)的`onSubmit`事件来替代
   */
  onConfirm?: CommonEventFunction<InputProps.inputValueEventDetail>;
  /** 键盘高度发生变化的时候触发此事件
   * event.detail = {height: height, duration: duration}
   * @supported weapp
   */
  onKeyboardHeightChange?: CommonEventFunction<InputProps.onKeyboardHeightChangeEventDetail>;
  /** 用于透传 `WebComponents` 上的属性到内部 H5 标签上
   * @supported h5
   */
  nativeProps?: Record<string, unknown>;
}

export interface FieldProps extends BaseTypeProps, FieldCommonProps {
  children?: React.ReactNode;
  /** 是否开启点击反馈 */
  clickable?: boolean;
  /** 是否显示内边框 */
  border?: boolean;
  /** 是否显示内边框 */
  borderStyle?: React.CSSProperties;
  /** 是否显示输入框 */
  input?: boolean;
  /** 单元格大小 */
  size?: FieldSize;
  /** 单元格对齐方式 默认顶部对齐 */
  align?: FieldAlign;
  /** 是否胶囊样式展示	 */
  pill?: boolean;
  /** 是否内边框展示，pill = true 时有效 */
  hairline?: boolean;
  /** 自定义左侧图标 */
  icon?: React.ReactNode;
  /** 左侧图标大小 */
  iconSize?: number;
  /** 左侧图标额外样式 */
  iconStyle?: React.CSSProperties;
  /** 左侧图标额外类名	 */
  iconClass?: string;
  /** 左侧标题	*/
  title?: React.ReactNode;
  /** 左侧标题额外样式	*/
  titleStyle?: React.CSSProperties;
  /** 左侧标题额外类名	*/
  titleClass?: string;
  /** 左侧文本是否占据一行	*/
  titleRow?: boolean;
  /** 左侧文本宽度，默认单位为 px	 */
  titleWidth?: number;
  /** 左侧文本对齐方式 */
  titleAlign?: FieldTextAlign;
  /**  标题下方的描述信息	*/
  desc?: React.ReactNode;
  /**  描述信息额外样式	*/
  descStyle?: React.CSSProperties;
  /**  描述信息额外类名	*/
  descClass?: string;
  /** 是否在 label 后面添加冒号	 */
  colon?: boolean;
  /** 是否显示表单必填星号	 */
  required?: boolean;
  /**  右侧额外信息	*/
  right?: React.ReactNode;
  /**  右侧额外信息额外样式	*/
  rightStyle?: React.CSSProperties;
  /**  右侧额外信息额外类名	*/
  rightClass?: string;
  /** 额外的提示信息 */
  intro?: React.ReactNode;
  /** 额外的提示位置 */
  introPosition?: FieldIntroPosition;
  /**  额外的提示额外样式	*/
  introStyle?: React.CSSProperties;
  /** 是否将输入内容标红	 */
  error?: boolean;
  /** 是否显示错误图标	 */
  errorIcon?: boolean;
  /** 输入框错误时是否显示红色	 */
  errorInput?: boolean;
  /** 底部错误提示文案，为空时不展示 */
  errorMessage?: React.ReactNode;
  /** 底部错误提示文案，为空时不展示 */
  errorMessagePosition?: FieldErrorMessagePosition;
  /** 输入框对齐方式，可选值为 `center` `right` */
  inputAlign?: FieldTextAlign;
  /** 输入框额外样式 */
  inputStyle?: CSSProperties;
  /** 是否为只读状态，只读状态下无法输入内容  */
  readonly?: boolean;
  /** 是否启用清除图标，点击清除图标后会清空输入框  */
  clearable?: boolean;
  /**
   * 显示清除图标的时机，
   * always 表示输入框不为空时展示 focus 表示输入框聚焦且不为空时展示
   * @default 'focus'
   */
  clearTrigger?: FieldClearTrigger;

  /** 输入内容格式化函数 */
  formatter?: (val: string | number) => string;
  /**
   * 格式化函数触发的时机
   * @default 'onChange'
   */
  formatTrigger?: FieldFormatTrigger;
  /** 文本颜色 */
  color?: string;
  /** 是否显示字数统计，需要设置 maxlength 属性 */
  showWordLimit?: boolean;

  /** 是否显示右测箭头 */
  arrow?: boolean;
  /** 右测箭头方向 */
  arrowDirection?: FieldArrowDirection;

  onClear?: () => void;
  onClick?: () => void;
  onIcon?: () => void;
  onClickInput?: () => void;
  onRight?: () => void;
}
