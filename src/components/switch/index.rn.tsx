// @ts-ignore
import React, { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
import { View } from "@tarojs/components";
import { Animated } from "react-native";
import { OwlSwitchProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const OwlSwitch: FC<OwlSwitchProps> = props => {
  const [bem] = createNamespace("switch");

  const checkedOffset = useRef(new Animated.Value(2)).current;
  const checkedOn = () => {
    Animated.timing(checkedOffset,{
      useNativeDriver: false,
      toValue: 18,
      duration: 200
    }).start();
  };

  const checkedOff = () => {
    Animated.timing(checkedOffset, {
      useNativeDriver: false,
      toValue: 2,
      duration: 200
    }).start();
  };


  const [checked, setChecked] = useState(props.checked);
  useEffect(() => {
    if(props.checked){
      checkedOn();
    }else{
      checkedOff();
    }
    setChecked(props.checked);
  }, [props.checked]);

  const handleClick = () => {
    if (props.disabled) return;
    const tempChecked = !checked;
    const value = tempChecked ? props.activeValue : props.inactiveValue;
    setChecked(tempChecked);
    props.onChange && props.onChange(value);
  };

  let styles: CSSProperties = { };
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
      <Animated.View
        // @ts-ignore
        className={classnames(
          bem("handle",{
            disabled: props.disabled,
            checked: props.checked,
            [`${props.size}`]: props.size
          })
        )}
        style={{ left: checkedOffset, ...styles,...props.style }}
      />
    </View>
  );
};

OwlSwitch.defaultProps = {
  activeValue: true,
  inactiveValue: false
};

export default OwlSwitch;
