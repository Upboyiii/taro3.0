// @ts-ignore
import React, { CSSProperties, FC, useMemo, useState, useCallback } from "react";
import { View, Input } from "@tarojs/components";
import { StepperProps } from "./PropsType";
import { createNamespace, formatNumber, isDef, addUnit } from "../utils";
import { isNaN } from "../utils/validate/number";
import classnames from "classnames";
import "./index.scss";

function equal(value1?: string | number, value2?: string | number) {
  return String(value1) === String(value2);
}

// add num and avoid float number
function add(num1: number, num2: number) {
  const cardinal = 10 ** 10;
  return Math.round((num1 + num2) * cardinal) / cardinal;
}

const Stepper: FC<StepperProps> = props => {
  const [bem] = createNamespace("stepper");

  const format = useCallback((value: string | number | undefined) => {
      const { min, max, allowEmpty, decimalLength, integer } = props;
      if (allowEmpty && value === "") {
        return value;
      }
      value = formatNumber(String(value), !integer);
      value = value === "" ? 0 : +value;
      value = isNaN(value) ? min : value;
      // @ts-ignore
      value = Math.max(Math.min(+max, +value), +min);

      if (isDef(decimalLength)) {
        value = value.toFixed(+decimalLength);
      }
      return value;
    },
    [props.min, props.max, props.allowEmpty, props.decimalLength, props.integer]
  );

  const [inputValue, setInputValue] = useState(props.value);
  // 禁止减少按钮
  const minusDisabled = useMemo(() => {
    // @ts-ignore
    return props.disabled || props.disableMinus || inputValue <= +props.min;
  }, [props.disabled, props.disableMinus, props.min, inputValue]);

  // 禁止增加按钮
  const plusDisabled = useMemo(() => {
    // @ts-ignore
    return props.disabled || props.disablePlus || inputValue >= +props.max;
  }, [props.disabled, props.disablePlus, props.max, inputValue]);

  const renderMinus = () =>{
    if(props.showMinus){
      let styles: CSSProperties = { };
      if (props.buttonSize) {
        styles.width = addUnit(props.buttonSize);
        styles.height = addUnit(props.buttonSize);
      }
      return (
        <View
          style={styles}
          hoverStyle={!props.buttonPrimary && !minusDisabled ? { backgroundColor: "rgba(255,35,64,0.07)" } : {}}
          className={classnames(
            bem("btn", {
              [`${props.size}`]: props.size,
              [`${props.theme}`]: props.theme,
              primary: props.buttonPrimary,
              plain: props.plain && !props.buttonPrimary,
              disabled: minusDisabled
            }),
            bem("minus", { [`round-${props.theme}`]: props.theme && props.round, square: !props.round }),
            props.buttonClass,
            props.buttonMinusClass
          )}
          onClick={() => { buttonClick("minus"); }}
        >
          <View className={classnames(bem("icon"))}>
            <View className={classnames(bem("icon-item",{ "h": true, primary: props.buttonPrimary }))} />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderPlus = () =>{
    if(props.showPlus){
      let styles: CSSProperties = { };
      if (props.buttonSize) {
        styles.width = addUnit(props.buttonSize);
        styles.height = addUnit(props.buttonSize);
      }
      return (
        <View
          style={styles}
          hoverStyle={!(props.buttonPrimary || props.buttonPlusPrimary) && !plusDisabled ? { backgroundColor: "rgba(255,35,64,0.07)" } : {}}
          className={classnames(
            bem("btn", {
              [`${props.size}`]: props.size,
              [`${props.theme}`]: props.theme,
              primary: props.buttonPrimary || props.buttonPlusPrimary,
              plain: props.plain && !props.buttonPrimary && !props.buttonPlusPrimary,
              disabled: plusDisabled
            }),
            bem("plus", { [`round-${props.theme}`]: props.theme && props.round, square: !props.round }),
            props.buttonClass,
            props.buttonMinusClass
          )}
          onClick={() => {buttonClick("plus");}}
        >
          <View className={classnames(bem("icon"))}>
            <View className={classnames(bem("icon-item",{ "h": true, primary: props.buttonPrimary || props.buttonPlusPrimary }))} />
            <View className={classnames(bem("icon-item",{ "v": true, primary: props.buttonPrimary || props.buttonPlusPrimary }))} />
          </View>
        </View>
      );
    }
    return null;
  };
  const buttonClick = (type: string) => {
    onChange(type);
  };

  const onChange = (type: string, e?) => {
    const isMinus = type === "minus";
    if ((type === "plus" && plusDisabled) || (isMinus && minusDisabled)) {
      props.onOverlimit && props.onOverlimit(type);
      return;
    }

    // @ts-ignore
    const diff = isMinus ? -props.step : +props.step;
    const value = format(add(inputValue as number, diff));
    updateValue(value);
    if (isMinus) {
      props.onMinus && props.onMinus(value, e);
    } else {
      props.onPlus && props.onPlus(value, e);
    }
  };
  const updateValue = (value) =>{
    setInputValue(value);
    props.onChange && props.onChange(value);
  };
  const onInput = event => {
    const input = event.target as HTMLInputElement;
    const { value } = input;
    const { decimalLength } = props;
    let formatted = formatNumber(value, !props.integer);
    if (isDef(decimalLength) && formatted.includes(".")) {
      const pair = formatted.split(".");
      formatted = `${pair[0]}.${pair[1].slice(0, +decimalLength)}`;
    }
    const isNumeric = formatted === String(+formatted);
    updateValue(isNumeric ? +formatted : formatted);
  };
  const onBlur = event => {
    const input = event.target as HTMLInputElement;
    console.log(input,"input");
    const value = format(input.value);
    if (!equal(value, inputValue)) {
      updateValue(value);
    }
  };

  const renderInput = () => {
    if(props.showInput){
      let styles: CSSProperties = { };
      if (props.inputWidth) {
        styles.width = addUnit(props.inputWidth);
      }
      if (props.buttonSize) {
        styles.height = addUnit(props.buttonSize);
      }
      return (
        <Input
          type={props.integer ? "digit" : "number"}
          className={classnames(
            bem("input", {
              [`${props.theme}`]: props.theme,
              [`${props.theme}-plain`]: props.theme && props.plain,
              [`${props.size}`]: props.size,
              [`round-${props.theme}`]: props.theme && props.round,
              disabled: props.disabled || props.disableInput,
              readonly: props.readonlyInput
            }),
            props.inputClass
          )}
          style={styles}
          value={String(inputValue)}
          disabled={props.disabled || props.disableInput || props.readonlyInput}
          placeholder={props.placeholder}
          onInput={onInput}
          onBlur={onBlur}
          onClick={props.onClick}
        />
      );
    }
    return null;
  };

  return (
    <View
      className={classnames(
        props.className,
        bem({
          [`${props.theme}`]: props.theme,
          plain: props.plain,
          round: props.round
        })
      )}
      style={props.style}
    >
      {renderMinus()}
      {renderInput()}
      {renderPlus()}
    </View>
  );
};

Stepper.defaultProps = {
  theme: "default",
  max: 999,
  min: 1,
  step: 1,
  integer: true,
  showPlus: true,
  showMinus: true,
  showInput: true
};
export default Stepper;


