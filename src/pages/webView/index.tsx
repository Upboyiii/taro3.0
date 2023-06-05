import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { WebView } from "@tarojs/components";
import classnames from "classnames";
import { getPlatform } from "@/utils/app";

const WebViewPage: FC = () => {

  const [url, setUrl] = useState("");
  // @ts-ignore
  const [title, setTitle] = useState("");

  useEffect(() => {
    let router = Taro.getCurrentInstance().router;
    console.log(router?.params,"router?.params");
    if (router?.params.title) {
      let atitle = decodeURIComponent(router?.params.title);
      setTitle(atitle);
      Taro.setNavigationBarTitle({ title:atitle });
    }
    if (router?.params.url) {
      setUrl(router?.params.url);
    }
  }, []);

  const handleLoad = (e) => {
    console.log(e,"handleLoad");
  };

  const handleMessage = (e) => {
    console.log(e,"handleMessage");
  };

  return (
    <React.Fragment>
      <WebView
        className={classnames({ "has-navbar": process.env.TARO_ENV === "h5" && getPlatform().name !== "wechat" })}
        src={url}
        onMessage={handleMessage}
        onLoad={handleLoad}
      />
    </React.Fragment>
  );
};

export default WebViewPage;
