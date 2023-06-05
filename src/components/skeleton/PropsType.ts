import { BaseTypeProps } from "../utils";
import React from "react";

export type SkeletonImageShape = "square" | "round";
export type SkeletonAnimate = "blink" | "breathe";
export type SkeletonDirection = "row" | "column";
export type SkeletonAlign = "start" | "center" | "end";
export type SkeletonContenAlign = "left" | "center" | "right" | "between";

export interface SkeletonProps extends BaseTypeProps {
    children?: React.ReactNode;
    /** 是否显示骨架屏，传 false 时会展示子组件内容	 */
    loading?: boolean;
    /** 是否卡片样式 */
    card?: boolean;
    /** 是否显示内边框 */
    border?: boolean;
    /** 排列方向
     * @default 'row'
     * */
    direction?: SkeletonDirection;
    /** 脚手架垂直对齐方式
     *  @default 'center'
     *  */
    align?: SkeletonAlign;
    /** 段落占位图排列方向 */
    contentDirection?: SkeletonDirection;
    /** 内容对齐方式
     *  @default 'left'
     *  */
    contentAlign?: SkeletonContenAlign;
    /** 占位图间隔大小  */
    spacing?: number;
    /** 背景颜色 */
    color?: string;
    /** 是否显示缩略图占位图  */
    image?: boolean;
    /** 缩略图占位图大小  */
    imageSize?: number | (string | number)[];
    /** 缩略图占位图形状
     * @default 'round'
     * */
    imageShape?: SkeletonImageShape;
    /** 是否显示标题占位图	 */
    title?: boolean;
    /** 标题占位图宽高，如果为数组[10,20] 第一个为宽，第二个为高  */
    titleSize?: number | (string | number)[];
    /** 段落占位图排列方向 */
    rowsDirection?: SkeletonDirection;
    /** 内容对齐方式
     *  @default 'left'
     *  */
    rowsAlign?: SkeletonContenAlign;
    /** 段落占位图行数 */
    row?: number;
    /** 段落占位图宽度，可传数组来设置每一行的宽度	 */
    rowWidth?: number | (string | number)[];
    /** 段落占位图高度，可传数组来设置每一行的高度	 */
    rowHeight?: number | (string | number)[];
    /** 是否显示操作按钮占位图 */
    action?: boolean;
    /** 操作按钮占位图宽度 */
    actionSize?: number | (string | number)[];
    /** 操作按钮占位图是否圆角 */
    actionRound?: boolean;
    /** 是否将标题和段落显示为圆角风格  */
    round?: boolean;
    /** 不需要内边距 */
    compact?: boolean;
    /** 是否开启动画以及动画名称  */
    animate?: SkeletonAnimate | boolean;
}
