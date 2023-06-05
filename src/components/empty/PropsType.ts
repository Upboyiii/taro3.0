import React from "react";
import { BaseTypeProps } from "../utils";

export type EmptySize = "small";
export type EmptyImage =
  | "default"
  | "error"
  | "network"
  | "store"
  | "closed"
  | "goods"
  | "cart"
  | "order"
  | "address"
  | "coupon"
  | "favorite"
  | "comment"
  | "message"
  | "jifen"
  | "memberCard"
  | "hotel"
  | "table"
  | "user"

export interface EmptyProps extends BaseTypeProps {
  children?: React.ReactNode;
  /** 是否卡片类显示 */
  card?: boolean;
  /** 图片类型，支持传入图片 URL 选值为：
    * default: 默认，error: 错误页，network: 网络故障，goods: 商品，cart: 购物车，order: 订单，store：店铺，closed：店铺打烊
    * address: 地址，coupon: 优惠券，favorite: 收藏，comment: 评价，message: 消息, jifen: 积分, memberCard: 权益卡, hotel: 酒店房间
    * */
  image?: EmptyImage | string | React.ReactNode;
  /** 图片大小 */
  imageSize?: number | string;
  /** 标题 */
  title?: string | React.ReactNode;
  /** 描述 */
  desc?: string | React.ReactNode;
  /** 大小 */
  size?: EmptySize;
}
