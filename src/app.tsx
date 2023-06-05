// @ts-ignore
import React, { Component, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import store from "@/store/index";
import persist from "@/store/persist";
// import * as app from "./utils/app";
import "./app.scss";

class App extends Component<PropsWithChildren> {

  async componentDidMount () {
    await persist();
    // app.update(); // 执行升级
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    );
  }
}
export default App;
