import React, { CSSProperties, FC, isValidElement } from "react";
import { View, Button, Image } from "@tarojs/components";
import { OwlButtonProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import Loading from "../loading";
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
                [`hairline-${props.shape}`]: props.shape && props.hairline && !props.plain,
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
    let styles: CSSProperties = {};
    if (props.iconSize) {
      styles.width = addUnit(props.iconSize);
      styles.height = addUnit(props.iconSize);
    }

    if (props.loading) {
      return (
        <Loading
          className={classnames(bem("loading"))}
          size={props.loadingSize}
          type={props.loadingType}
          color={props.loadingColor}
        />
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
              style={{ ...styles, ...props.iconStyle }}
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
    const styles: CSSProperties = {};
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
    <View className={classes} style={{ ...buttonStyle, ...props.style }} onClick={(e)=>{onClick(e);}}>
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
