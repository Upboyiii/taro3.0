import React from "react";
import { BaseTypeProps } from "../utils";

export interface ScrollViewProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 背景颜色 */
  bgColor?: string;
  /** 是否开启上拉加载  */
  pullUp?: boolean;
  /** 是否显示数据错误展示 */
  err?: boolean;
  /** 错误提示 */
  errText?: string;
  /** 加载中... 开启上拉加载时有效 */
  loading?: boolean;
  /** 数据总条数 开启上拉加载时有效 */
  /** 上拉提示 */
  pullText?: string;
  /** 加载中提示 */
  loadingText?: string;
  /** 没有数据了提示 */
  emptyText?: string;
  /** 是否开启下拉刷新 */
  refresh?: boolean;
  /** 下加载中... */
  refreshing?: boolean;
  /** 加载更多 */
  loadMore?: boolean;
  /** 加载更多 */
  loadStart?: boolean;
  /** 下拉刷新事件 */
  onRefresh?: () => void;
  /** 上拉刷新事件 */
  onPullUp?: () => void;
}
