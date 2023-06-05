import React, { CSSProperties } from "react";
import { ButtonProps } from "@tarojs/components/types/Button";
import { BaseTypeProps } from "../utils";
// import { LoadingType } from "../loading/PropsType";

type TaroButtonProps = Pick<
  ButtonProps,
  | "formType"
  | "openType"
  | "scope"
  | "lang"
  | "sessionFrom"
  | "sendMessageTitle"
  | "sendMessagePath"
  | "sendMessageImg"
  | "showMessageCard"
  | "appParameter"
  | "onContact"
  | "onGetUserInfo"
  | "onGetPhoneNumber"
  | "onOpenSetting"
  | "onError"
  | "onGetAuthorize"
>;

export type ButtonType = "default" | "primary" | "success" | "info" | "warning" | "text";
export type ButtonSize = "large" | "medium" | "normal" | "small" | "mini";
export type ButtonIconPosition = "right" | "left";
export type ButtonShape = "round" | "square";
export type LoadingType = "circular" | "spinner" | "ball" | "well";

export interface OwlButtonProps extends BaseTypeProps, TaroButtonProps {
  children?: React.ReactNode;
  /** 按钮类型 */
  type?: ButtonType;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /**
   * 按钮文本
   * 业务内建议使用children代替
   * */
  text?: string | React.ReactNode;
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 图标展示位置，可选值为 `right` */
  iconPosition?: ButtonIconPosition;
  /** 图标额外样式 */
  iconStyle?: CSSProperties | any;
  /** 图标大小 */
  iconSize?: number;
  /** 按钮颜色，支持传入 linear-gradient 渐变色 */
  color?: string;
  /** 按钮文字颜色 */
  textColor?: string;
  /** 按钮文字额外样式 */
  textStyle?: CSSProperties | any;
  /** 是否为朴素按钮	 */
  plain?: boolean;
  /** 是否为淡色按钮 */
  tinge?: boolean;
  /** 按钮形状	 */
  shape?: ButtonShape;
  /** 是否显示为加载状态	 */
  loading?: boolean;
  /**
   * 加载图标类型，可选值为 `spinner`
   * @default circular
   * 不支持 rn
   * */
  loadingType?: LoadingType;
  /** 加载状态提示文字 */
  loadingText?: string;
  /** 加载图标大小, 不支持 rn	 */
  loadingSize?: number;
  /** 加载图标颜色, 只支持rn	 */
  loadingColor?: string;
  /** 是否使用 0.5px 边框	 */
  hairline?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮水平内间距	 */
  paddingHorizontal?: number;
  /** 点击事件 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
