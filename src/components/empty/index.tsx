// @ts-ignore
import React, { FC, isValidElement, useMemo } from "react";
import { View, Image } from "@tarojs/components";
import { createNamespace, getSizeStyle } from "../utils";
import { EmptyProps } from "./PropsType";
import classnames from "classnames";
import "./index.scss";

const PRESET_IMAGES = {
  default: require("@/assets/empty/default.png"),
  error: require("@/assets/empty/error.png"),
  network: require("@/assets/empty/network.png"),
  store: require("@/assets/empty/store.png"),
  closed: require("@/assets/empty/closed.png"),
  goods: require("@/assets/empty/goods.png"),
  cart: require("@/assets/empty/cart.png"),
  order: require("@/assets/empty/order.png"),
  address: require("@/assets/empty/address.png"),
  coupon: require("@/assets/empty/coupon.png"),
  favorite: require("@/assets/empty/favorite.png"),
  comment: require("@/assets/empty/comment.png"),
  message: require("@/assets/empty/message.png"),
  jifen: require("@/assets/empty/jifen.png"),
  memberCard: require("@/assets/empty/memberCard.png"),
  hotel: require("@/assets/empty/hotel.png"),
  table: require("@/assets/empty/table.png"),
  user: require("@/assets/empty/user.png")
};

const Empty: FC<EmptyProps> = props => {
  const [bem] = createNamespace("empty");

  const renderImage = () => {
    if(props.image){
      if (typeof props.image !== "string" && isValidElement(props.image)) {
        return props.image;
      }
      if (Object.keys(PRESET_IMAGES).indexOf(props.image as string) > -1) {
        let imageUrl = PRESET_IMAGES[props.image as string || "default"];
        return (
          <Image
            className={classnames(bem("image-icon"))}
            mode="aspectFill"
            src={imageUrl}
          />
        );
      }else{
        return (
          <Image
            className={classnames(bem("image-icon"))}
            mode="aspectFill"
            src={props.image as string}
          />
        );
      }
    }
    return null;
  };

  const renderTitle = () => {
    if (props.title) {
      return <View className={classnames(bem("title", { [`${props.size}`]: props.size }))}>{props.title}</View>;
    }
    return null;
  };

  const renderDesc = () => {
    if (props.desc) {
      return <View className={classnames(bem("desc", { [`${props.size}`]: props.size }))}>{props.desc}</View>;
    }
    return null;
  };

  const renderAction = () => {
    if (props.children) {
      return <View className={classnames(bem("action", { [`${props.size}`]: props.size }))}>{props.children}</View>;
    }
    return null;
  };

  return (
    <View
      className={classnames(bem({ [`${props.size}`]: props.size, card: props.card }), props.className)}
      style={props.style}
    >
      <View className={classnames(bem("image", { [`${props.size}`]: props.size }))} style={getSizeStyle(props.imageSize)}>
        {renderImage()}
      </View>
      {renderTitle()}
      {renderDesc()}
      {renderAction()}
    </View>
  );
};
Empty.defaultProps = {
  image: "default"
};
export default Empty;
