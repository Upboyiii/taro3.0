// @ts-ignore
import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
import { View } from "@tarojs/components";
import { OwlSwitchProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const OwlSwitch: FC<OwlSwitchProps> = props => {
  const [bem] = createNamespace("switch");

  const [checked, setChecked] = useState(props.checked);
  useEffect(() => {
    setChecked(props.checked);
  }, [props.checked]);

  const handleClick = () => {
    if (props.disabled) return;
    const tempChecked = !checked;
    const value = tempChecked ? props.activeValue : props.inactiveValue;
    setChecked(tempChecked);
    props.onChange && props.onChange(value);
  };

  let styles: CSSProperties = {};
  if (props.inactiveColor) {
    styles.backgroundColor = props.inactiveColor;
  }
  if (props.activeColor && checked) {
    styles.backgroundColor = props.activeColor;
  }

  return (
    <View
      className={classnames(
        bem({
          disabled: props.disabled,
          checked: props.checked,
          [`${props.size}`]: props.size
        }),
        props.className
      )}
      style={{ ...styles,...props.style }}
      onClick={handleClick}
    >
      <View
        className={classnames(
          bem("handle",{
            disabled: props.disabled,
            checked: props.checked,
            [`${props.size}`]: props.size
          })
        )}
      />
    </View>
  );
};

OwlSwitch.defaultProps = {
  activeValue: true,
  inactiveValue: false
};

export default OwlSwitch;
