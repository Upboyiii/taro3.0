import React, { FC, useState, useEffect, CSSProperties } from "react";
import { View } from "@tarojs/components";
import { OwlCheckboxProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const OwlCheckbox: FC<OwlCheckboxProps> = props => {
  const [bem] = createNamespace("checkbox");

  const [checked, setChecked] = useState(props.checked);

  useEffect(() => {
    setChecked(props.checked);
  }, [props.checked]);

  const renderIcon = () => {
    let styles: CSSProperties = {};
    let iconStyles: CSSProperties = {};
    if (props.size) {
      styles.width = addUnit(props.size);
      styles.height = addUnit(props.size);
    }
    if(props.type !== "check"){
      if (props.defaultColor && !checked && !props.disabled && !props.indeterminate) {
        styles.borderColor = props.defaultColor;
      }
      if (props.color && !props.disabled && (checked || props.indeterminate)) {
        styles.borderColor = props.color;
        styles.backgroundColor = props.color;
      }
    }else{
      if (props.defaultColor && !props.disabled && !checked) {
        iconStyles.borderColor = props.defaultColor;
      }
      if (props.color && !props.disabled && checked) {
        iconStyles.borderColor = props.color;
      }
    }

    return (
      <View
        className={classnames(
          bem("checkbox", {
            [`${props.type}`]: props.type,
            [`${props.type}-checked`]: props.type && (checked || props.indeterminate) && !props.disabled,
            [`${props.type}-disabled`]: props.type && props.disabled && !checked,
            [`${props.type}-disabled-checked`]: props.type && props.disabled && (checked || props.indeterminate)
          })
        )}
        style={{ ...styles, ...props.iconStyle }}
      >
        <View
          className={classnames(
            bem("icon", {
              default: props.type === "default" && checked && !props.indeterminate,
              "check": props.type === "check",
              "check-checked": props.type === "check" && checked && !props.disabled,
              "check-disabled": props.type === "check" && !checked && props.disabled,
              indeterminate: props.indeterminate && props.type !== "check"
            })
          )}
          style={iconStyles}
        />
      </View>
    );
  };

  const renderLabel = () => {
    return (
      <View
        style={props.labelStyle}
        className={classnames(
          bem("label", { disabled: props.disabled })
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
        className={classnames(bem("desc", { disabled: props.disabled }))}
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
              cell: props.cell,
              [`${props.labelPosition}`]: props.labelPosition && props.cell
            })
          )}
          style={props.contentStyle}
        >
          {!!props.children ? props.children : (
            <React.Fragment>
              {renderLabel()}
              {!!props.desc && props.cell ? renderDesc() : null}
            </React.Fragment>
          )}
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
    if (!props.disabled) {
      const latest = !checked;
      props.onChange && props.onChange(latest);
      setChecked(latest);
    }
  };

  return (
    <View
      style={props.style}
      className={classnames(bem({ cell: props.cell }), props.className)}
      onClick={onClick}
    >
      {props.cell && props.border ? (
        <View className={classnames(bem("border",{ [`${props.labelPosition}`]: props.labelPosition }))} />
      ) : null}
      {props.cell && props.labelPosition === "left" ? (
        <React.Fragment>
          {renderContent()}
          {renderRight()}
          {renderIcon()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {renderIcon()}
          {renderContent()}
          {renderRight()}
        </React.Fragment>
      )}
    </View>
  );
};

OwlCheckbox.defaultProps = {
  type: "default",
  labelPosition: "left",
  border: true
};

export default OwlCheckbox;
