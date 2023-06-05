import React, { CSSProperties, FC } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { ScrollViewProps } from "./PropsType";
import Divider from "@/components/divider";
import Empty from "@/components/empty";
import "./index.scss";

const OwlScrollView: FC<ScrollViewProps> = props => {

  const { loading = false, refreshing = false  } = props;

  let stytes: CSSProperties = { flex: 1 };
  if(props.bgColor){
    stytes.backgroundColor = props.bgColor;
  }

  const onMomentumScrollEnd = (event) => {
    if(props.err) return;
    if(props.pullUp){
      const offSetY = event.nativeEvent.contentOffset.y; // 获取滑动的距离
      const contentsizeHeight = event.nativeEvent.contentSize.height; // scrollView contentSize 高度
      const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; // scrollView高度

      if (offSetY + oriageScrollHeight >= contentsizeHeight - 1){
        if(!loading){
          props.onPullUp && props.onPullUp();
        }
      }
    }
  };

  const onRefresh = () => {
    // if(props.err) return;
    props.onRefresh && props.onRefresh();
  };

  return (
    <ScrollView
      // @ts-ignore
      style={stytes}
      refreshControl={
        props.refresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      onScrollEndDrag={onMomentumScrollEnd}
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
  pullText: "上拉加载更多",
  errText: "加载错误，请返回重试",
  emptyText: "没有更多数据啦~"
};

export default OwlScrollView;


