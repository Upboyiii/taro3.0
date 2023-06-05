import React from "react";
import { BaseTypeProps } from "../utils";


export interface CitySelectProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 弹出狂显示 */
  show: boolean;
  /** 选中的城市ID */
  value?: number;
  /** 标题文本 */
  title?: string;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 点击取消按钮时触发的事件 */
  onCancel?: () => void;
  /** 点击确认按钮时触发的事件 */
  onConfirm?: ( values: any ) => void;
}
