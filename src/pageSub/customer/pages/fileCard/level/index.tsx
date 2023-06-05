import React, { FC, useState, useEffect } from "react";
import { View, Image } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "../memberCard/detail/index.scss";

const Level: FC = () => {

  const tabs = [
    { label: "免费会员", value: 1 },
    { label: "付费会员", value: 2 }
  ];
  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setTabsActive(val);
    getList(val);
  };

  const [pageList, setPageList] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState<number>(-1);
  const [growth, setGrowth] = useState<number>(0);

  const getList = (type)=>{
    setErr(false);
    setPageList([]);
    setLoading(true);
    customerApi.level.page({ page: 1, page_size: 999, type: type, order_key: "+created_at" }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          const list = res.data?.list;
          let _disabled = -1;
          list.some((item, index) => {
            if (item.state === 2) {
              _disabled = index;
              return true;
            }
          });
          _disabled = _disabled === -1 ? list.length : _disabled;
          setGrowth(list[list.length - 1]?.free_growth || -1);
          setDisabled(_disabled);
          setPageList(list);
          setTotal(res.data?.total || 0);
        }
      }else{
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    getList(1);
    eventCenterOn("levelEdit", (res) => {
      if(!!res && !!res[0]){
        setTabsActive(res[0]);
        getList(res[0]);
      }else{
        setTabsActive(1);
        getList(1);
      }
    });
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getList(tabsActive);
    },500);
  };

  const [bem] = createNamespace("card","member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Tabs active={tabsActive} options={tabs} onChange={handelTabs} bgColor="#fff" border />
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        pullUp={!loading}
      >
        {loading ? (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {pageList.length > 0 ? (
                  <React.Fragment>
                    {pageList.map((item: any, index) => {
                      return (
                        <View
                          className="card"
                          key={index}
                          style={index === 0 ? { marginTop: addUnit(12) } : {}}
                          onClick={() => {
                            navigateTo({
                              url: "/pages/customer/level/detail/index",
                              method:"navigateTo",
                              params: { id: item.id, disabled: disabled, growth: `${pageList[index - 1]?.free_growth || 0}to${pageList[index + 1]?.free_growth || -1}` }
                            });
                          }}
                        >
                          <Cell
                            border={false}
                            align="start"
                            icon={
                              <View
                                className={classnames(bem("card"))}
                                style={{
                                  width: addUnit(72),
                                  height: addUnit(44),
                                  borderRadius: addUnit(4)
                                  // opacity: item.state === 2 ? 0.3 : 1
                                }}
                              >
                                <View
                                  className={classnames(bem("backdrop"))}
                                  style={{ backgroundColor: item.color_code || "#646666" }}
                                >
                                  <Tag
                                    plain={false}
                                    mark
                                    size="small"
                                    textColor="#fff"
                                    color="rgba(255,255,255,.3)"
                                    style={{
                                      fontWeight: "bold",
                                      position: "absolute",
                                      left: addUnit(4),
                                      top: addUnit(4)
                                    }}
                                  >
                                    {`${ item.type === 1 ? "VIP" : "SVIP"}${ item.type === 1 ? item.level_value : "" }`}
                                  </Tag>
                                  <Image
                                    className={classnames(bem("backdrop-watermark"))}
                                    src={item.type === 1 ? require("@/assets/card/level-vip.png") : require("@/assets/card/level-svip.png")}
                                    mode="aspectFill"
                                    style={{ width: addUnit(48), height: addUnit(40) }}
                                  />
                                  {item.cover_url && item.cover_url !== "" && item.cover_url !== "string" ? (
                                    <Image className={classnames(bem("backdrop-image"))} src={base.file_host + "/" + item.cover_url} mode="aspectFill" />
                                  ) : null}
                                </View>
                              </View>
                            }
                            title={item.name}
                            textStyle={{ fontSize: addUnit(16), fontWeight: "bold", color: "#333" }}
                            label={item.type === 1 ? `需${ item?.free_growth || 0 }成长值` : undefined}
                            labelStyle={{ fontSize: addUnit(13), color: "#666" }}
                            extra={item.state === 2 ? <Tag plain={false} type="primary">已停用</Tag> : null}
                            style={{
                              paddingTop: addUnit(15),
                              paddingBottom: addUnit(15)
                            }}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关会员卡" image="memberCard" />
                )}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        {!loading ? (
          <Button
            style={{ width: "70%" }}
            type="info"
            disabled={total > disabled && tabsActive === 1}
            onClick={()=>{
              if(total > disabled && tabsActive === 1) return;
              navigateTo({ url: "/pages/customer/level/edit/index", method:"navigateTo", params: { type: tabsActive, growth: growth + "to-1", level: pageList.length  } });
            }}
          >
            {total > disabled && tabsActive === 1 ? `VIP${total}已停用，无法添加VIP${total + 1}` : `添加${tabsActive === 1 ? "免费" : "付费"}等级`}
          </Button>
        ) : (
          <Skeleton compact title titleSize={["100%", 44]} round color="#fff" style={{ backgroundColor: "transparent" }} />
        )}
      </BottomBar>
    </View>
  );
};

export default Level;

