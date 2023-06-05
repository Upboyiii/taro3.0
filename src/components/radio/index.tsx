import React, { FC, useState, useEffect, CSSProperties } from "react";
import { View } from "@tarojs/components";
import { OwlRadioProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const OwlRadio: FC<OwlRadioProps> = props => {
  const [bem] = createNamespace("radio");

  const [value, setValue] = useState(props.value);
  const [checked, setChecked] = useState(props.checked);
  const [disabled, setDisabled] = useState(props.disabled);

  useEffect(() => {
    setValue(props.value);
    setChecked(props.checked);
    setDisabled(props.disabled);
  }, [props.disabled, props.checked, props.value]);

  const renderButton = () => {
    const getHexOpacityColor = (color = "#000",opacity = 0.5) =>{
      opacity = Math.max(opacity,0);
      opacity = Math.min(opacity,1);
      color = color.replace(/#/g,"").toUpperCase();
      if(color.length === 3){
        let arr = color.split("");
        color = "";
        for (let i = 0; i < arr.length; i++) {
          color += (arr[i] + arr[i]);// 将简写的3位字符补全到6位字符
        }
      }
      let num = Math.round(255 * opacity);// 四舍五入
      let str = "";
      let arrHex = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];// 十六进制数组
      while (num > 0) {
        let mod = num % 16;
        num = (num - mod) / 16;
        str = arrHex[mod] + str;
      }
      if(str.length == 1)str = "0" + str;
      if(str.length == 0)str = "00";
      return `#${color + str}`;
    };
    let styles: CSSProperties = {};
    if(props.type === "button"){
      if (props.color && checked) {
        if (props.plain) {
          styles.color = props.color;
          styles.borderColor = props.color;
          styles.backgroundColor = getHexOpacityColor(props.color, 0.05);
        }else{
          styles.backgroundColor = props.color;
        }
      }
    }
    return (
      <View
        className={classnames(
          bem("button", {
            [`${props.size}`]: props.size && typeof props.size === "string",
            plain: props.plain,
            round: props.round,
            disabled: disabled,
            checked: checked && !props.plain,
            "checked-plain": checked && props.plain
          })
        )}
        style={{ ...styles, ...props.style }}
        onClick={onClick}
      >
        {renderLabel()}
        {!!props.desc ? renderDesc() : null}
      </View>
    );
  };

  const renderIcon = () => {
    let styles: CSSProperties = {};
    let iconStyles: CSSProperties = {};
    if (props.size && typeof props.size === "number") {
      styles.width = addUnit(props.size);
      styles.height = addUnit(props.size);
    }
    if(props.type !== "check"){
      if (props.defaultColor && !checked && !disabled) {
        styles.borderColor = props.defaultColor;
      }
      if (props.color && !disabled && checked) {
        styles.borderColor = props.color;
        if(props.type === "default"){
          styles.backgroundColor = props.color;
        }else{
          iconStyles.backgroundColor = props.color;
        }
      }
    }else{
      if (props.color && !disabled && checked) {
        iconStyles.borderColor = props.color;
      }
      if (disabled) {
        iconStyles.borderColor = "#e5e6e6";
      }
    }

    return (
      <View
        className={classnames(
          bem("radio", {
            [`${props.type}`]: props.type,
            [`${props.type}-checked`]: props.type && checked && !disabled,
            [`${props.type}-disabled`]: props.type && disabled && !checked,
            [`${props.type}-disabled-checked`]: props.type && disabled && checked
          })
        )}
        style={{ ...styles, ...props.iconStyle }}
      >
        <View
          className={classnames(
            bem("icon", {
              [`${props.type}`]: props.type && checked,
              [`${props.type}-disabled`]: props.type && checked && disabled
            })
          )}
          style={iconStyles}
        />
      </View>
    );
  };

  const renderLabel = () => {
    let styles: CSSProperties = {};
    if(props.type === "button"){
      if (props.defaultColor && !checked) {
        styles.color = props.defaultColor;
      }
      if (props.color && props.plain && checked) {
        styles.color = props.color;
      }
    }

    return (
      <View
        style={{ ...styles,...props.labelStyle }}
        className={classnames(
          bem("label", {
            disabled,
            [`${props.size}`]: props.size && typeof props.size === "string",
            [`${props.type}`]: props.type,
            "button-checked": props.type === "button" && checked && !props.plain,
            "button-checked-plain": props.type === "button" && checked && props.plain
          })
        )}
      >
        {!!props.children ? props.children : props.label}
      </View>
    );
  };

  const renderDesc = () => {
    return (
      <View
        style={props.descStyle}
        className={classnames(
          bem("desc", {
            disabled,
            [`${props.type}`]: props.type,
            [`${props.size}`]: props.size && typeof props.size === "string"
          })
        )}
      >
        {props.desc}
      </View>
    );
  };

  const renderContent = () => {
    if(!!props.children || !!props.label){
      return (
        <View
          className={classnames(
            bem("content",{
              [`${props.labelPosition}`]: props.labelPosition,
              default: props.type === "default" && !props.cell
            })
          )}
        >
          {renderLabel()}
          {!!props.desc ? renderDesc() : null}
        </View>
      );
    }
    return null;
  };

  const renderRight = () => {
    if(!!props.right && (!!props.children || !!props.label)){
      return (
        <View
          style={props.rightStyle}
          className={classnames(bem("right",{ [`${props.labelPosition}`]: props.labelPosition }))}
        >
          {props.right}
        </View>
      );
    }
    return null;
  };

  const onClick = () => {
    if (!disabled && !checked) {
      setChecked(!checked);
      props.onChange && props.onChange(value);
    }
    props.onClick && props.onClick();
  };

  if(props.type === "button") return renderButton();
  return (
    <View
      style={props.style}
      className={classnames(bem({ cell: props.cell }), props.className)}
      onClick={onClick}
    >
      {props.cell && props.border ? (
        <View className={classnames(bem("border",{ [`${props.labelPosition}`]: props.labelPosition }))} />
      ) : null}
      {(props.labelPosition === "right" || (props.type === "default" && !props.cell)) ? (
        <React.Fragment>
          {renderIcon()}
          {renderContent()}
          {renderRight()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {renderContent()}
          {renderRight()}
          {renderIcon()}
        </React.Fragment>
      )}
    </View>
  );
};

OwlRadio.defaultProps = {
  type: "default",
  labelPosition: "left",
  border: true
};

export default OwlRadio;
