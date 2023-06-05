import React from "react";
import { BaseTypeProps } from "../utils";

interface FileItem {
  path: string;
  size: number;
}

export interface File {
  url: string;
  file?: FileItem;
}
/** 图片预览模式，详见[微信开发者文档](https://developers.weixin.qq.com/miniprogram/dev/component/image.html) */
export type ImagePickerMode = "scaleToFill" | "aspectFit" | "aspectFill" | "widthFix" | "top" | "bottom" | "center" | "left" | "right" | "top left" | "top right" | "bottom left" | "bottom right";

export interface ImagePickerProps extends BaseTypeProps {
  refs?:String;
  /** 图片文件数组, 元素为对象, 包含属性 url（必选) */
  files: File[];
  /** 标题文本 */
  title?: React.ReactNode;
  /** 标题文本额外类 */
  titleClass?: string;
  /** 标题文本额外样式 */
  titleStyle?: React.CSSProperties;
  /**
   * 图片预览模式
   * @default 'aspectFill'
   */
  mode?: ImagePickerMode;
  /** 是否可以预览图片 */
  preview?: boolean;
  /**
   * 是否显示添加图片按钮
   * @default true
   */
  showAdd?: boolean;
  /** 添加图片按钮图标 */
  addIcon?: string;
  /** 添加图片按钮文本 */
  addText?: string;
  /** 图片为空时， 添加按钮是否占据一行 */
  addRow?: boolean;
  /**
   * 是否显示删除按钮
   * @default true
   */
  deletable?: boolean;
  /**
   * 最多可以选择的图片张数
   */
  maxCount?: number;
  /**
   * 单行的图片数量，不能为 0 或负数
   * @default 4
   */
  rowCount?: number;
  /**
   * 所选的图片的尺寸
   * @default ['original', 'compressed']
   */
  sizeType?: string[];
  /**
   * 选择图片的来源
   * @default ['album', 'camera']
   */
  sourceType?: string[];
  /**
   * files 值发生变化触发的回调函数,
   * operationType 操作类型有添加，移除，如果是移除操作，则第三个参数代表的是移除图片的索引
   */
  onChange: (files: File[], operationType: "add" | "remove", index?: number) => void;
  /** 点击图片触发的回调 */
  onImageClick?: (index: number, file: Object) => void;
  /** 选择失败触发的回调 */
  onFail?: (message: string) => void;
}
