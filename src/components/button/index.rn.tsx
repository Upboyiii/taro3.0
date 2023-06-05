import React, { CSSProperties, FC, isValidElement } from "react";
import { View, Button, Image } from "@tarojs/components";
import { ActivityIndicator } from "react-native";
import { OwlButtonProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const OwlButton: FC<OwlButtonProps> = props => {
  const [bem] = createNamespace("button");

  const classes = classnames(
    props.className,
    bem([
      props.type,
      props.size,
      {
        [`${props.shape}`]: props.shape,
        [`tinge-${props.type}`]: props.tinge,
        plain: props.plain || props.hairline,
        loading: props.loading,
        disabled: props.disabled,
        hairline: props.hairline
      }
    ])
  );


  const onClick = event => {
    if (props.loading || props.disabled) return;
    if (props.onClick) props.onClick(event);
  };

  const onGetUserInfo = event => {
    props.onGetUserInfo && props.onGetUserInfo(event);
  };
  const onContact = event => {
    props.onContact && props.onContact(event);
  };
  const onGetPhoneNumber = event => {
    props.onGetPhoneNumber && props.onGetPhoneNumber(event);
  };
  const onError = event => {
    props.onError && props.onError(event);
  };
  const onOpenSetting = event => {
    props.onOpenSetting && props.onOpenSetting(event);
  };
  const onGetAuthorize = event => {
    props.onGetAuthorize && props.onGetAuthorize(event);
  };

  const renderBorder = () => {
    if((props.plain || props.hairline) && props.type !== "text"){
      const styles: Record<string, string | number> = {};
      if (props.color) {
        styles.borderColor = props.color;
      }
      return (
        <View
          className={classnames(
            bem("border",
              {
                hairline: props.hairline,
                [`hairline-${props.shape}`]: props.shape && props.hairline,
                [`${props.shape}`]: props.shape && !props.hairline,
                [`${props.type}`]: props.type
              })
          )}
          style={styles}
        />
      );
    }
    return null;
  };
  const renderButton = () => {
    if (!props.loading && !props.disabled) {
      if (process.env.TARO_ENV === "h5") {
        return <Button className={classnames(bem("wxbutton"))} />;
      } else {
        return (
          <Button
            className={classnames(bem("wxbutton"))}
            lang={props.lang}
            formType={props.formType}
            openType={props.openType}
            scope={props.scope}
            sessionFrom={props.sessionFrom}
            sendMessageTitle={props.sendMessageTitle}
            sendMessagePath={props.sendMessagePath}
            sendMessageImg={props.sendMessageImg}
            showMessageCard={props.showMessageCard}
            appParameter={props.appParameter}
            onGetAuthorize={onGetAuthorize}
            onGetUserInfo={onGetUserInfo}
            onClick={onClick}
            onGetPhoneNumber={onGetPhoneNumber}
            onOpenSetting={onOpenSetting}
            onError={onError}
            onContact={onContact}
          />
        );
      }
    }

    return null;
  };
  const renderIcon = () => {
    const iconSize = (): CSSProperties => {
      if (props.iconSize) {
        return { width: addUnit(props.iconSize), height: addUnit(props.iconSize) };
      }
      return {};
    };

    if (props.loading) {
      let color = "#ffffff";
      if(props.plain || props.hairline || props.tinge){
        if(props.type === "default"){
          color = "#333333";
        }else if(props.type === "primary"){
          color = "#ff2340";
        }else if(props.type === "success"){
          color = "#00c35c";
        }else if(props.type === "info"){
          color = "#0080ff";
        }else if(props.type === "warning"){
          color = "#ff7e00";
        }
      }

      if (props.loadingColor) {
        color = props.loadingColor;
      }
      return (
        <ActivityIndicator color={color} />
      );
    }
    if (props.icon) {
      return (
        <React.Fragment>
          {typeof props.icon !== "string" && isValidElement(props.icon) ? (
            <View className={classnames(bem("icon", props.iconPosition))} style={props.iconStyle}>
              {props.icon}
            </View>
          ) : (
            <Image
              className={classnames(bem("icon",{ image: true }))}
              style={{ ...iconSize(), ...props.iconStyle }}
              // @ts-ignore
              src={props.icon}
              mode="aspectFill"
            />
          )}
        </React.Fragment>
      );
    }

    return null;
  };
  const renderText = () => {
    const styles: Record<string, string | number> = {};
    if (props.color) {
      styles.color = props.plain || props.hairline ? props.color : "#ffffff";
    }
    if (props.textColor) {
      styles.color = props.textColor;
    }

    let text = props.loading ? props.loadingText : (props.children || props.text);
    if (text) {
      return (
        <View
          className={classnames(
            bem("text",
              {
                [`plain-${props.type}`]: (props.plain || props.hairline || props.tinge) && props.type !== "text",
                [`${props.size}`]: props.size,
                [`${props.type}`]: props.type === "text" || props.type === "default"
              })
          )}
          style={{ ...styles, ...props.textStyle }}
        >
          {text}
        </View>
      );
    }
    return null;
  };

  const buttonStyle: CSSProperties = {};
  if (props.color) {
    if (!props.plain && !props.hairline) {
      buttonStyle.backgroundColor = props.color;
    }
  }
  if (typeof props.paddingHorizontal === "number") {
    buttonStyle.paddingLeft = addUnit(props.paddingHorizontal);
    buttonStyle.paddingRight = addUnit(props.paddingHorizontal);
  }
  return (
    <View className={classes} style={{ ...buttonStyle, ...props.style }} onClick={onClick}>
      {renderBorder()}
      {renderButton()}
      {props.iconPosition === "left" && renderIcon()}
      {renderText()}
      {props.iconPosition === "right" && renderIcon()}
    </View>
  );
};

OwlButton.defaultProps = {
  type: "default",
  size: "normal",
  shape: "round",
  iconPosition: "left"
};

export default OwlButton;
