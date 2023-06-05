import { inBrowser } from "../base";

export function isAndroid(): boolean {
  return inBrowser ? /android/.test(window.navigator.userAgent.toLowerCase()) : false;
}

export function isIOS(): boolean {
    return inBrowser ? /ios|iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) : false;
}
