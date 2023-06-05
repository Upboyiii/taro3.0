import React, { CSSProperties, FC } from "react";
import { ScrollView } from "@tarojs/components";
import { ScrollViewProps } from "./PropsType";
import { scrollViewStyle } from "@/components/utils";
import Divider from "@/components/divider";
import Empty from "@/components/empty";
import "./index.scss";

const OwlScrollView: FC<ScrollViewProps> = props => {

  const { loading = false, refreshing = false  } = props;

  let stytes: CSSProperties = { flex: 1 };
  if(props.bgColor){
    stytes.backgroundColor = props.bgColor;
  }

  const onRefresh = () => {
    // if(props.err) return;
    props.onRefresh && props.onRefresh();
  };

  const onPullUp = () => {
    if(props.err) return;
    props.onPullUp && props.onPullUp();
  };

  return (
    <ScrollView
      style={{ ...stytes,...scrollViewStyle() }}
      scrollWithAnimation
      scrollY
      refresherEnabled={props.refresh}
      refresherTriggered={refreshing}
      refresherBackground="#f6f6f6"
      onRefresherRefresh={onRefresh}
      onScrollToLower={onPullUp}
      enableFlex
    >
      {!props.err ? (
        <React.Fragment>
          {props.children}
          {props.pullUp ? (
            <React.Fragment>
              {props.loadMore ? (
                <React.Fragment>
                  {props.loadStart || loading ? (
                    <Divider>{loading ? props.loadingText : props.pullText}</Divider>
                  ) : (
                    <Divider>{props.emptyText}</Divider>
                  )}
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}
        </React.Fragment>
      ) : (
        <Empty desc={props.errText} image="error" />
      )}
    </ScrollView>
  );
};

OwlScrollView.defaultProps = {
  loadingText: "加载中...",
  errText: "加载错误，请返回重试",
  pullText: "上拉加载更多",
  emptyText: "没有更多数据啦~"
};

export default OwlScrollView;


