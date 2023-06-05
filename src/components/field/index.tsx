import React, { CSSProperties, isValidElement, useEffect, useMemo, useState } from "react";
import { Image, Input, Text, Textarea, View } from "@tarojs/components";
import { FieldFormatTrigger, FieldProps } from "./PropsType";
import { addUnit, createNamespace, formatNumber, isObject } from "../utils";
// @ts-ignore
import Eye from "@/assets/components/eye.png";
// @ts-ignore
import EyeClosed from "@/assets/components/eye-closed.png";
// @ts-ignore
import ErrIcon from "@/assets/components/warn.png";
// @ts-ignore
import Close from "@/assets/components/close.png";
import classnames from "classnames";
import "./index.scss";

const Field = (props: FieldProps) => {
  const [bem] = createNamespace("field");

  const [inputValue, SetInputValue] = useState("");
  const [inputFocus, setInputFocus] = useState(!!props.focus);
  const getModelValue = () => String(props.value ?? "");

  useEffect(() => {
    SetInputValue(props.value);
  }, [props.value]);

  useEffect(() => {
    setInputFocus(!!props.focus);
  }, [props.focus]);

  useEffect(() => {
    if (inputValue) {
      updateValue(getModelValue());
    }
  }, [inputValue]);

  const updateValue = (value: any, trigger: FieldFormatTrigger = "onChange") => {
    let val = value;
    if (props.type === "digit" || props.type === "tel") {
      val = formatNumber(val, false, false);
    }
    if (props.type === "number") {
      val = formatNumber(val, true, true);
    }
    if (props.type === "tel" && !props.formatter) {
      const regTel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      const regNumber = /[^-0-9]/g;
      val = !regTel.test(val) && val.length > 11 ? val.substring(0, 11) : val.replace(regNumber, "");
    }
    if (props.type === "idcard" && !props.formatter) {
      const regTel = /^(\d{18}|\d{17}Xx)$/;
      const regNumber = /[^-0-9Xx]/g;
      val = !regTel.test(val) && val.length > 18 ? val.substring(0, 18) : val.replace(regNumber, "");
    }
    // if (isDef(props.maxlength) && val.length > +props.maxlength) {
    //   val = val.slice(0, Number(props.maxlength));
    // }
    if (props.formatter && trigger === props.formatTrigger) {
      val = props.formatter(val);
    }
    SetInputValue(val);
    props.onChange && props.onChange(val);
  };

  const maxLength = type => {
    if (type === "tel") return 11;
    if (type === "idcard") return 18;
    return props.maxlength;
  };
  const handleFocus = (e) => {
    setInputFocus(true);
    props.onFocus && props.onFocus(e);
  };
  const handleBlur = e => {
    setInputFocus(false);
    props.onBlur && props.onBlur(e);
  };
  const handleChange = e => {
    let val: any = (e.target as any).value;
    if (!!maxLength && val.length > Number(maxLength)) {
      val = val.slice(0, Number(maxLength));
    }
    updateValue(val, "onChange");
  };

  // 是否显示内边框
  const renderBorder = () => {
    if(props.border && !props.pill){
      return (
        <View className={classnames(bem("border"))} style={props.borderStyle} />
      );
    }
    return null;
  };

  // 左侧图标
    const renderIcon = () => {
    if (props.icon) {
      const iconSize = (): CSSProperties => {
        if (props.iconSize) {
          return { width: addUnit(props.iconSize), height: addUnit(props.iconSize) };
        }
        return {};
      };
      return (
        <React.Fragment>
          {typeof props.icon !== "string" && isValidElement(props.icon) ? (
            <View
              className={classnames(bem("icon"), props.iconClass)}
              style={props.iconStyle}
              onClick={props.onIcon}
            >
              {props.icon}
            </View>
          ) : (
            <Image
              className={classnames(bem("icon",{ image: true }), props.iconClass)}
              style={{ ...iconSize(), ...props.iconStyle }}
              // @ts-ignore
              src={props.icon}
              mode="aspectFill"
              onClick={props.onIcon}
            />
          )}
        </React.Fragment>
      );
    }
    return null;
  };

  // 标题
  const titleStyle = (): CSSProperties => {
    if (props.titleWidth && !props.titleRow) {
      return { width: addUnit(props.titleWidth) };
    }
    return {};
  };
  const renderDesc = () => {
    if (props.desc) {
      return (
        <View
          className={classnames(
            bem("desc", {
              row: props.titleRow,
              [`${props.size}`]: props.size,
              [`${props.titleAlign}`]: props.titleAlign
            }),
            props.descClass
          )}
          style={props.descStyle}
        >
          {props.desc}
        </View>
      );
    }
    return null;
  };
  const renderTitle = () => {
    if (props.title) {
      return (
        <View
          className={classnames( bem("title", { row: props.titleRow }), props.titleClass )}
          style={{ ...titleStyle() }}
        >
          <View
            className={classnames(
              bem("label", {
                error: props.error,
                disabled: props.disabled,
                [`${props.size}`]: props.size,
                [`${props.titleAlign}`]: props.titleAlign
              })
            )}
            style={props.titleStyle}
          >
            {props.required && <Text className={classnames(bem("required"))}>*</Text>}
            {props.title}{props.colon && "："}
          </View>
          {renderDesc()}
          {props.errorMessagePosition === "title" && props.titleRow ? renderMessage() : null}
        </View>
      );
    }
    return null;
  };

  // 是否显示清除按钮
  const showClear = useMemo(() => {
    if (props.clearable && !props.readonly && !props.disabled && inputValue.length > 0) {
      return props.clearTrigger === "always" || (props.clearTrigger === "focus" && inputFocus);
    }
    return false;
  }, [props.clearTrigger, inputValue,inputFocus]);
  const handleClear = () => {
    updateValue("");
    props.onClear && props.onClear();
    // setInputFocus(true);
  };
  const renderClear = () => {
    if (!showClear) return null;
    return (
      <View className={classnames(bem("clear"))} onTouchStart={handleClear}>
        <Image
          className={classnames(bem("clear-icon"))}
          src={Close}
          mode="aspectFill"
        />
      </View>
    );
  };

  // 错误提示图标
  const renderErrorIcon = () => {
    if (!props.error || !props.errorIcon) return null;
    return (
      <Image
        className={classnames(bem("error-icon"))}
        src={ErrIcon}
        mode="aspectFill"
      />
    );
  };

  // type = "password" 的显隐密码
  const [password, setPassword] = useState(props.type === "password");
  useEffect(() => {
    setPassword(props.type === "password");
  }, [props.type]);
  const onEyeIcon = () => {
    setPassword(preState => {
      return !preState;
    });
  };
  const renderEyeIcon = () => {
    if (props.type !== "password") return null;
    return (
      <View className={classnames(bem("eye", { active: !password }))} onClick={onEyeIcon}>
        <Image
          className={classnames(bem("eye-icon"))}
          src={!password ? EyeClosed : Eye}
          mode="aspectFill"
        />
      </View>
    );
  };

  // 右侧额外信息
  const renderRight = () => {
    if (props.right) {
      return (
        <View
          className={classnames(bem("right"), props.rightClass)}
          style={props.rightStyle}
          onClick={props.onRight}
        >
          {props.right}
        </View>
      );
    }
    return null;
  };

  // 字数限制提示
  const renderWordLimit = () => {
    const { value, showWordLimit, maxlength } = props;
    if (showWordLimit && maxlength) {
      const count = (value ? `${value}` : "").length;
      return (
        <View className={classnames(bem("word-limit", { textarea: props.type === "textarea" }))}>
          <Text className={classnames(bem("word-num"))}>{count}/{maxlength}</Text>
        </View>
      );
    }
    return null;
  };

  // 输入框下面的错误提示文字
  const renderMessage = () => {
    const message = props.errorMessage && props.error;
    if (message) {
      return (
        <View className={classnames(
          bem("error-message",
            {
              [`${props.inputAlign}`]: props.inputAlign,
              title: props.errorMessagePosition === "title" && props.titleRow
            })
        )}
        >
          {props.errorMessage}
        </View>
      );
    }
    return null;
  };

  // 额外的提示信息
  const renderIntro = () => {
    if (props.intro) {
      return (
        <View
          className={classnames(
            bem("intro", {
              [`${props.inputAlign}`]: props.inputAlign,
              [`${props.introPosition}`]: props.introPosition
            })
          )}
          style={props.introStyle}
        >
          {props.intro}
        </View>
      );
    }
    return null;
  };

  // 箭头
  const renderArrow = () => {
    if (props.arrow) {
      return (
        <View
          className={classnames(bem("arrow",{ [`${props.arrowDirection}`]:props.arrowDirection, [`${props.size}`]: props.size }))}
        />
      );
    }
    return null;
  };

  // textarea 设置最大高度和最小高度
  const adjustSize = useMemo(() => {
    if (!(props.type === "textarea" && props.autosize)) {
      return props.inputStyle;
    }
    if (isObject(props.autosize)) {
      const { maxHeight, minHeight } = props.autosize;
      const style: CSSProperties = { ...props.inputStyle };
      if (maxHeight) {
        style.maxHeight = addUnit(maxHeight);
      }
      if (minHeight) {
        style.minHeight = addUnit(minHeight);
      }
      return style;
    }
  }, [props.type, props.autosize]);

  const renderInput = () => {
    const { type, error, errorInput, disabled, readonly } = props;
    const inputFontSize = (): CSSProperties => {
      if (props.size === "large") {
        return { fontSize: addUnit(16) };
      }else if(props.size === "small") {
        return { fontSize: addUnit(12) };
      }
      return {};
    };
    const controlClass = bem("input", {
      disabled,
      readonly,
      text: !props.input,
      error: props.error && props.errorInput,
      "min-height": props.type === "textarea" && !props.autosize,
      textarea: props.type === "textarea",
      [`${props.inputAlign}`]: props.inputAlign,
      [`${props.size}`]: props.size
    });
    const inputType = type => {
      if (type === "tel") return "number";
      if (type === "password" || type === "textarea" || type === "search") return "text";
      return type;
    };
    const attribute = {
      type: inputType(props.type),
      name: props.name,
      placeholder: props.placeholder,
      placeholderStyle: props.placeholderStyle,
      placeholderClass: props.placeholderClass,
      disabled: props.disabled || props.readonly,
      maxlength: maxLength(props.type),
      focus: inputFocus,
      // focus: props.focus,
      cursorSpacing: props.cursorSpacing,
      cursor: props.cursor,
      selectionStart: props.selectionStart,
      selectionEnd: props.selectionEnd,
      adjustPosition: props.adjustPosition,
      holdKeyboard: props.holdKeyboard,
      confirmType: props.confirmType,
      onInput: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onConfirm: props.onConfirm,
      onKeyboardHeightChange: props.onKeyboardHeightChange,
      nativeProps: props.nativeProps,
      className: classnames(controlClass)
    };
    if(!props.input){
      let styles: CSSProperties = {};
      if(!(props.value || props.children) && !!props.placeholder){
        styles.color = "#ccc";
      }else if (props.color) {
        styles.color = props.color;
      }
      return (
        <View
          className={classnames(controlClass)}
          style={{ ...styles, ...inputFontSize(), ...props.inputStyle, textAlign: `${props.inputAlign ?? "left"}` }}
        >
          {props.value || props.children || props.placeholder}
        </View>
      );
    }
    if(type === "textarea"){
      return (
        <Textarea
          {...attribute}
          value={inputValue}
          // @ts-ignore
          autoHeight={props.autoHeight}
          fixed={props.fixed}
          showConfirmBar={props.showConfirmBar}
          disableDefaultPadding={props.disableDefaultPadding}
          onLineChange={props.onLineChange}
          style={{ color: props.color, lineHeight: addUnit(20), paddingTop: 0, ...inputFontSize(), textAlign: `${props.inputAlign ?? "left"}`, ...adjustSize }}
        />
      );
    } else {
      return (
        <Input
          {...attribute}
          value={inputValue}
          password={password}
          placeholderTextColor={error && errorInput ? "#ff3447" : props.placeholderTextColor}
          confirmHold={props.confirmHold}
          style={{ color: props.color, ...inputFontSize(), ...props.inputStyle, textAlign: `${props.inputAlign ?? "left"}` }}
        />
      );
    }
  };

  return (
    <View
      style={props.style}
      // hoverStyle={!!props.clickable ? { backgroundColor: "#f9fafa" } : {}}
      className={classnames(
        bem({
          [`${props.align}`]: props.align,
          [`${props.size}`]: props.size,
          clickable: props.clickable,
          pill: props.pill,
          "pill-textarea": props.pill && props.textarea,
          hairline: props.pill && props.hairline,
          wrap: props.titleRow
        }),
        props.className
      )}
      onClick={props.onClick}
    >
      {renderBorder()}
      {!props.titleRow ? renderIcon() : null}
      {renderTitle()}
      <View className={classnames(bem("body", { wrap: props.titleRow }))}>
        {props.introPosition === "top" ? renderIntro() : null}
        <View className={classnames(bem("control-wrapper", { start: props.type === "textarea" }))} onClick={props.onClickInput}>
          {props.titleRow ? renderIcon() : null}
          <View className={classnames(bem("control"))}>
            {renderInput()}
          </View>
          {props.type !== "textarea" ? renderWordLimit() : null}
          {renderClear()}
          {renderErrorIcon()}
          {renderEyeIcon()}
          {renderRight()}
          {renderArrow()}
        </View>
        {props.type === "textarea" ? renderWordLimit() : null}
        {!(props.errorMessagePosition === "title" && props.titleRow) ? renderMessage() : null}
        {props.introPosition === "bottom" ? renderIntro() : null}
      </View>
    </View>
  );
};

Field.defaultProps = {
  border: true,
  value: "",
  type: "text",
  input: true,
  clearTrigger: "always",
  formatTrigger: "onChange",
  confirmType: "done",
  introPosition: "top",
  errorMessagePosition: "content",
  maxlength: 140,
  adjustPosition: true,
  errorIcon: true,
  arrowDirection: "right"
};

export default Field;
