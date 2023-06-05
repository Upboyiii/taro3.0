import { CSSProperties } from "react";
import { isDef, inBrowser } from "..";
import { isNumeric } from "../validate/number";

export function addUnit(value?: string | number): string | undefined {
  if (!isDef(value)) {
    return undefined;
  }
  value = String(value);
  if(process.env.TARO_ENV === "h5"){
    return isNumeric(value) ? `${+value / 20}rem` : value;
  }else if(process.env.TARO_ENV === "weapp"){
    return isNumeric(value) ? `${+value * 2}rpx` : value;
  }else if(process.env.TARO_ENV === "rn"){
    // @ts-ignore
    return +value;
  }else{
    return isNumeric(value) ? `${value}px` : value;
  }
}

// 滚动内容flex fix
export function scrollViewStyle () {
  let styles: CSSProperties = { flex: 1 };
  if(process.env.TARO_ENV === "h5" || process.env.TARO_ENV === "rn"){
    styles.height = "100%";
  }else{
    styles.height = 0;
  }
  return styles;
}

export function getSizeStyle(originSize?: string | number) {
  if (isDef(originSize)) {
    const size = addUnit(originSize);
    return {
      width: size,
      height: size
    };
  }
  return {};
}

// cache
let rootFontSize: number;

function getRootFontSize() {
  if (!rootFontSize) {
    const doc = document.documentElement;
    const fontSize = doc.style.fontSize || window.getComputedStyle(doc).fontSize;

    rootFontSize = parseFloat(fontSize);
  }

  return rootFontSize;
}

function convertRem(value: string) {
  value = value.replace(/rem/g, "");
  return +value * getRootFontSize();
}

function convertVw(value: string) {
  value = value.replace(/vw/g, "");
  return (+value * window.innerWidth) / 100;
}

function convertVh(value: string) {
  value = value.replace(/vh/g, "");
  return (+value * window.innerHeight) / 100;
}

export function unitToPx(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  if (inBrowser) {
    if (value.indexOf("rem") !== -1) {
      return convertRem(value);
    }
    if (value.indexOf("vw") !== -1) {
      return convertVw(value);
    }
    if (value.indexOf("vh") !== -1) {
      return convertVh(value);
    }
  }

  return parseFloat(value);
}

export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}
