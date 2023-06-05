
/**
 * @desc 数组转树形
 */
export const list2Tree = (oldArr, parentKey = "pid", key = "id", topParentVal = -1) => {
  oldArr.forEach(element => {
    if (element[parentKey] !== "" && element[parentKey] !== topParentVal) {
      oldArr.forEach(ele => {
        if (ele[key] === element[parentKey]) {
          if (!ele.children) {
            ele.children = [];
          }
          ele.children.push(element);
        }
      });
    }
  });
  oldArr = oldArr.filter(ele => !(parentKey in ele) || ele[parentKey] === "" || ele[parentKey] === topParentVal);
  return oldArr;
};
/**
 * 树转数组
 */
export const treeToList = (tree = []) => {
  let queen = [];
  const out = [];
  queen = queen.concat(tree);
  while ( queen.length ) {
    const first: any = queen.shift();
    if (first.children) {
      queen = queen.concat(first.children);
      delete first["children"];
    }
    // @ts-ignore
    out.push(first);
  }
  return out;
};

/**
 * 格式化价格 (分)
 * @param price
 */
export const formatPrice = (price: number) => {
  try {
    price = Number(price) / 100;
    price = price ? price : 0;
  } catch (e) {
    return "0.00";
  }
  return price.toFixed(2);
};

/**
 * 格式化字节大小（b）
 * @param bytes
 */
export const bytesToSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  let precis = bytes / Math.pow(k, i);
  if (precis < 1024 && precis >= 1000) {
    return precis + " " + sizes[i];
  }
  return precis.toPrecision(3) + " " + sizes[i];
};

/**
 *时间戳转日期时间
 * @param timestamp
 * @param is_date 是否只返回日期
 */
export const formatTime = (timestamp: number, is_date = true) => {
  if (timestamp.toString().length === 10) {
    timestamp = timestamp * 1000;
  }
  const date = new Date(timestamp);
  const format = "{y}-{m}-{d} {h}:{i}:{s}";
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const formatDate = format.replace(/{([ymdhis])+}/g, (_res, key) => {
    const value = formatObj[key];
    return value.toString().padStart(2, "0");
  });
  if (is_date) {
    return formatDate.slice(0, 10);
  }
  return formatDate;
};

/**
 *获取时间戳
 * @param date
 */
export const getTimeStamp = (date?:string)=>{
  date = date ? date.replace(/-/g,"/") : new Date().toString();
  return Date.parse(date) / 1000;
};


/**
 * @desc 秒数格式化
 */
export const secToDate = (seconds = 0, cFormat = "{y}-{M}-{d} {h}:{m}:{s}") => {
  if (seconds.toString().length === 10) {
    seconds *= 1000;
  }
  const date = new Date(seconds);
  const formatObj = {
    y: date.getFullYear(),
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };

  // @ts-ignore
  return cFormat.replace(/{([yMdhmsa]+)}/g, (match, p1) => {
    const value = formatObj[p1];
    if (p1 === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
};
/**
 * 时间转化成时间秒（时间戳）
 * @param time
 */
export const timeToSecond = (time) => {
  let [h, min] = Array.from(time.split(":"), Number);
  let current = Date.UTC(1970, 1, 1, h, min);
  let base = Date.UTC(1970, 1, 1, 0, 0);
  let delta = current - base;
  return delta / 1000;
};

/**
 * 时间秒（时间戳）转化成时间
 * @param second
 */
export const secondToTime = (second = 0) =>{
 function padLeft(str, size) {
    const s = "00000" + str;
    return s.substr(s.length - size);
  }
  if (second === 0) {
    // return "00:00:00";
    return "00:00";
  } else if (Math.floor(second / 3600) > 0) {
    return (
      padLeft(Math.floor(second / 3600), 2) +
      ":" +
      padLeft(Math.floor(Math.floor(second % 3600) / 60), 2)
      // ":" +
      // padLeft(second % 60, 2)
    );
  } else {
    // return padLeft(Math.floor(Math.floor(second % 3600) / 60), 2) + ":" + padLeft(second % 60, 2);
    return "00:" + padLeft(Math.floor(Math.floor(second % 3600) / 60), 2);
  }
};

/**
 * 格式化星期展示
 * @param arr
 */
export const week2ZH = (arr:number[] = []) => {
  if (arr.length === 7) {
    return "每天";
  } else if (arr.length === 0) {
    return "";
  } else {
    let str = "";
    if (arr.indexOf(1) > -1) {
      str += "周一";
    }
    if (arr.indexOf(2) > -1) {
      if (str) {
        str += "、周二";
      } else {
        str += "周二";
      }
    }
    if (arr.indexOf(3) > -1) {
      if (str) {
        str += "、周三";
      } else {
        str += "周三";
      }
    }
    if (arr.indexOf(4) > -1) {
      if (str) {
        str += "、周四";
      } else {
        str += "周四";
      }
    }
    if (arr.indexOf(5) > -1) {
      if (str) {
        str += "、周五";
      } else {
        str += "周五";
      }
    }
    if (arr.indexOf(6) > -1) {
      if (str) {
        str += "、周六";
      } else {
        str += "周六";
      }
    }
    if (arr.indexOf(7) > -1) {
      if (str) {
        str += "、周日";
      } else {
        str += "周日";
      }
    }
    if (arr.length === 5 && arr.indexOf(6) === -1 && arr.indexOf(0) === -1) {
      str = "工作日";
    }
    if (arr.length === 2 && arr.indexOf(6) > -1 && arr.indexOf(0) > -1) {
      str = "周末";
    }
    return str;
  }
};

export const mul = (arg1, arg2) => {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) {}
  try {
    m += s2.split(".")[1].length;
  } catch (e) {}
  return (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) / Math.pow(10, m);
};

export const div = (arg1, arg2) => {
  let t1 = 0;
  let t2 = 0;
  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch (e) {}
  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch (e) {}
  const r1 = Number(arg1.toString().replace(".", ""));
  const r2 = Number(arg2.toString().replace(".", ""));
  return mul(r1 / r2, Math.pow(10, t2 - t1));
};

/**
 * 节流
 * @param func
 * @param wait
 * @param immediate
 * @returns
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function () {
    let context = this;
    let args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      let callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args);
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
  };
};

/**
 * 随机字符串
 * @param number
 */
export const getRandom = (number = 4) => {
  return Math.random()
    .toString(36)
    .slice(-number)
    .replace(".", "0");
};
