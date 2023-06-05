import React, { FC, useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Navbar from "@/components/navbar";
import Checkbox from "@/components/checkbox";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Customer: FC = () => {

  const pageSize = 15;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);

  // @ts-ignore
  const [searchInfo, setSearchInfo] = useState({
    focus: false,
    search: false,
    keyword: "", // 手机号/昵称/姓名
    levels: [], // 拥有的会员等级列表
    created_at_end: "", // 成为客户时间 2006-01-02 15:04:05
    created_at_start: "" // 成为会员时间 example: 2006-01-02 15:04:05
  });

  const getList = (page, refresh = false, params = {}) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    customerApi.customer.page({ page: page, page_size: pageSize, order_key: "-created_at", ...params }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data?.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          setPageList(list => {
            return [...list, ...res.data.list];
          });
        } else {
          setIsPage(false);
        }
      } else {
        setErr(true);
      }
    }).catch(() => {
      setErr(true);
    }).finally(() => {
      setLoading(false);

      setRefreshing(false);
      setPulling(false);
    });
  };

  useEffect(() => {
    getList(1, true);
    eventCenterOn("customer", () => {
      getList(1, true);
      setBatch(false);
    });
    return () => {
      eventCenterOff("customer");
    };
  }, []);

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let _page = parseInt(val) + 1;
        getList(_page);
        return _page;
      });
    }
  };
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getList(1, true);
    },500);
  };

  const handleActionShow = (type, ids) => {
    navigateTo({ url: "/pages/customer/index/batch/index", method: "navigateTo", params: { ids: ids, type: type } });
  };

  const [allChecked, setAllChecked] = useState(false);
  const [batch, setBatch] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkList, setCheckList] = useState<any>([]);
  const allCheckedClick = (val) => {
    setIndeterminate(false);
    setAllChecked(val);
    if (val) {
      setCheckList(pageList.map(item => item.info.id));
    } else {
      setCheckList([]);
    }
  };

  const batchClick = (type) => {
   // console.log(checkList, "checkList");
    if (checkList.length === 0) {
      Taro.showToast({ title: "请选择商品再进行操作", icon: "none", duration: 1000 });
      return;
    }
    if (type !== 5) {
      navigateTo({ url: "/pages/customer/index/batch/index", method: "navigateTo", params: { ids: checkList, type: type } });
    } else {
      Taro.showActionSheet({
        itemList: ["禁止购买", "取消禁止购买", "禁止发起会话", "取消禁止发起会话"],
        success: function (res) {
          const value = res.tapIndex === 0 || res.tapIndex === 2 ? 1 : 2;
          const mode = res.tapIndex === 0 || res.tapIndex === 1 ? "buy" : "chat";
          let form = {
            type: 5,
            customers: checkList,
            ban: {
              [mode]: value
            }
          };
          batchSave(form);
        }
      });
    }
  };
  const batchSave = (form) => {
    customerApi.customer.operate(form)
      .then(resp => {
        if (resp.code === 0) {
          Taro.showToast({ title: "设置成功" });
          allCheckedClick(false);
          setBatch(prevState => { return !prevState; });
          getList(1, true);
        } else {
          Taro.showToast({ title: resp.message, icon: "none" });
        }
      });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Navbar
        title="客户管理"
        right={
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: 30,
              color: "#333",
              fontWeight: "bold"
            }}
          >
            {batch ? "完成" : "批量管理"}
          </View>
        }
        onClickRight={() => {
          allCheckedClick(false);
          setBatch(prevState => { return !prevState; });
        }}
      />
      <View
        style={{
          position: "relative",
          paddingLeft: addUnit(14),
          paddingRight: addUnit(14),
          paddingBottom: addUnit(8),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff"
        }}
      >
        <View className="hairline hairline--bottom" />
        <Field
          style={{
            flex: 1,
            paddingTop: addUnit(4),
            paddingBottom: addUnit(4),
            paddingLeft: addUnit(10),
            paddingRight: addUnit(13)
          }}
          pill
          clearable
          align="center"
          iconStyle={{ marginRight: addUnit(8) }}
          iconSize={18}
          icon={require("@/assets/icons/search.png")}
          focus={searchInfo.focus}
          type="search"
          confirmType="search"
          size="small"
          value={searchInfo.keyword}
          placeholder="搜索：输入手机号/昵称/姓名"
          onChange={(val) => {
            setSearchInfo(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp.keyword = val;
              return temp;
            });
          }}
          onFocus={() => {
            setSearchInfo(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp.focus = true;
              return temp;
            });
          }}
          onConfirm={(val) => {
            setSearchInfo(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp.search = true;
              return temp;
            });
            getList(1, true, { keyword: val.detail.value });
          }}
        />
        {searchInfo.focus ? (
          <Button
            size="small"
            style={{ marginLeft: addUnit(8) }}
            onClick={() => {
              setSearchInfo(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.focus = false;
                temp.search = false;
                temp.keyword = "";
                getList(1, true, { keyword: "" });
                return temp;
              });
            }}
          >
            取消
          </Button>
        ) : null}
      </View>
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        pullUp={!loading}
        loading={pulling}
        loadMore={total > pageSize}
        loadStart={total > page * pageSize}
        onPullUp={onScrollToLower}
        bgColor="#f7f8f8"
      >
        {loading ? (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    align="start"
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48, 12]}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {pageList.length > 0 ? (
              <React.Fragment>
                {pageList.map((item: any, index) => {
                  return (
                    <View
                      className="card"
                      key={index}
                      onClick={() => {
                        if (batch) {
                          setCheckList(prevState => {
                            let temp = JSON.parse(JSON.stringify(prevState));
                            if (temp.indexOf(item.info.id) > -1) {
                              temp.splice(temp.indexOf(item.info.id), 1);
                            } else {
                              temp.push(item.info.id);
                            }
                            console.log(item.info.id, temp, "temp");
                            setAllChecked(temp.length === pageList.length);
                            setIndeterminate(temp.length > 0 && temp.length !== pageList.length);
                            return temp;
                          });
                        } else {
                          navigateTo({ url: "/pages/customer/index/edit/index", method: "navigateTo", params: { form: item } });
                        }
                      }}
                      style={{
                        marginTop: index === 0 ? addUnit(12) : 0,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start"
                      }}
                    >
                      {batch ? (
                        <View
                          style={{
                            paddingLeft: addUnit(14),
                            paddingTop: addUnit(25)
                          }}
                        >
                          <Checkbox
                            checked={checkList.indexOf(item.info.id) > -1}
                            onChange={(val)=>{
                              setCheckList(prevState => {
                                let temp = JSON.parse(JSON.stringify(prevState));
                                if(val){
                                  if (temp.indexOf(item.info.id) === -1) {
                                    temp.push(item.info.id);
                                  }
                                }else{
                                  if (temp.indexOf(item.info.id) > -1) {
                                    temp.splice(temp.indexOf(item.info.id), 1);
                                  }
                                }

                                setAllChecked(temp.length === pageList.length);
                                setIndeterminate(temp.length > 0 && temp.length !== pageList.length);
                                return temp;
                              });
                            }}
                          />
                        </View>
                      ) : null}
                      <Cell
                        align="start"
                        size="large"
                        border={index !== 0}
                        borderStyle={{ borderTopColor: "#eee", left: addUnit(14) }}
                        icon={
                          <Image
                            style={{ width: addUnit(40), height: addUnit(40), opacity: 0.7 }}
                            src={require("@/assets/avatar.png")}
                            mode="aspectFill"
                          />
                        }
                        contentAlign="left"
                        content={
                          <React.Fragment>
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                              <Text
                                style={{
                                  fontSize: addUnit(15),
                                  fontWeight: "bold",
                                  color: searchInfo.search && item.info.name.indexOf(searchInfo.keyword) > -1 ? "#ff2340" : "#333"
                                }}
                              >
                                {item.info.name}
                              </Text>
                              {!item.info.state || item.info?.state !== 1 ? (
                                <Tag
                                  size="small"
                                  style={{ marginLeft: addUnit(8) }}
                                  type={!item.info.state ? "info" : item.info.state === 2 ? "primary" : item.info.state === 3 ? "default" : "default"}
                                >
                                  {!item.info.state ? "邀请中" : item.info.state === 2 ? "已拒绝" : item.info.state === 3 ? "已退出" : "正常"}
                                </Tag>
                              ) : null}
                              {!!item?.info?.ban && Object.keys(item?.info?.ban).length > 0 ? (
                                <React.Fragment>
                                  {!!item?.info?.ban["buy"] ? (
                                    <Tag
                                      size="small"
                                      style={{ marginLeft: addUnit(8) }}
                                      type="primary"
                                    >
                                      禁止购买
                                    </Tag>
                                  ) : null}
                                  {!!item?.info?.ban["chat"] ? (
                                    <Tag
                                      size="small"
                                      style={{ marginLeft: addUnit(8) }}
                                      type="warning"
                                    >
                                      禁止发起会话
                                    </Tag>
                                  ) : null}
                                </React.Fragment>
                              ) : null}
                            </View>
                            {!!item.info.phone ? (
                              <View style={{ fontSize: addUnit(13), color: "#666", marginTop: addUnit(4) }}>
                                {item.info.phone}
                              </View>
                            ) : null}
                            {!!item.benefit_list && item.benefit_list.length > 0 ? (
                              <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: addUnit(6) }}>
                                <Text style={{ fontSize: addUnit(12), color: "#666" }}>权益卡： </Text>
                                {item.benefit_list.map((benefit, idx) => {
                                  return (
                                    <React.Fragment key={`benefit-${index}-${idx}`}>
                                      {idx !== 0 ? <Text style={{ fontSize: addUnit(12), color: "#999" }}>、</Text> : null}
                                      <Text style={{ fontSize: addUnit(12), color: "#333" }}>{benefit.card_name}</Text>
                                      {!!benefit.state && benefit.state !== 1 ? (
                                        <Tag
                                          size="mini"
                                          type={benefit.state === 3 ? "primary" : benefit.state === 4 ? "warning" : "default"}
                                          style={{ marginLeft: addUnit(2) }}
                                        >
                                          {{ 0: "未激活", 1: "正常", 2: "已到期", 3: "已下架", 4: "已删除" }[benefit.state]}
                                        </Tag>
                                      ) : null}
                                    </React.Fragment>
                                  );
                                })}
                              </View>
                            ) : null}
                            {!!item.levels && item.levels.length > 0 ? (
                              <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: addUnit(6) }}>
                                <Text style={{ fontSize: addUnit(12), color: "#666" }}>会员等级： </Text>
                                {item.levels.map((level, idx) => {
                                  return (
                                    <React.Fragment key={`benefit-${index}-${idx}`}>
                                      {idx !== 0 ? <Text style={{ fontSize: addUnit(12), color: "#999" }}>、</Text> : null}
                                      <Text style={{ fontSize: addUnit(12), color: "#333" }}>{level.level_name}</Text>
                                    </React.Fragment>
                                  );
                                })}
                              </View>
                            ) : null}
                          </React.Fragment>
                        }
                        extra={
                          !batch && (
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: addUnit(-4),
                                marginRight: addUnit(-4),
                                height: addUnit(24),
                                paddingLeft: addUnit(6),
                                paddingRight: addUnit(6)
                              }}
                              onClick={() => {
                                Taro.showActionSheet({
                                  itemList: ["给积分", "设置权益卡", "设置会员等级", "添加提醒"],
                                  success: function (res) {
                                    const index = res.tapIndex === 3 ? 6 : res.tapIndex + 2;
                                    handleActionShow(index, [item.info.id]);
                                  }
                                });
                              }}
                            >
                              {Array(3)
                                .fill("")
                                .map((_, i) => {
                                  return (
                                    <View
                                      key={`dot-${index}-${i}`}
                                      style={{
                                        width: addUnit(3),
                                        height: addUnit(3),
                                        marginLeft: addUnit(2),
                                        marginRight: addUnit(2),
                                        overflow: "hidden",
                                        borderRadius: addUnit(89),
                                        backgroundColor: "#999"
                                      }}
                                    />
                                  );
                                })}
                            </View>
                          )
                        }
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关客户" image="user" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar bgColor={batch ? "#fff" : "#f7f8f8"} border={batch}>
        {batch ? (
          <View className="customer-batch">
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={(val) => { allCheckedClick(val); }}
            >
              全选
            </Checkbox>
            <View className="customer-batch__group">
              <View
                className="customer-batch__item"
                style={{ borderLeftWidth: addUnit(0.5), borderTopLeftRadius: addUnit(8), borderBottomLeftRadius: addUnit(8) }}
                onClick={() => {
                  batchClick(2);
                }}
              >
                给积分
              </View>
              <View className="customer-batch__item" onClick={() => { batchClick(3); }}>
                权益卡
              </View>
              <View className="customer-batch__item" onClick={() => { batchClick(4); }}>
                会员等级
              </View>
              <View
                className="customer-batch__item"
                style={{ borderTopRightRadius: addUnit(8), borderBottomRightRadius: addUnit(8) }}
                onClick={() => { batchClick(5); }}
              >
                黑名单
              </View>
            </View>
          </View>
        ) : (
          <Button
            style={{ width: "70%" }}
            type="info"
            onClick={() => {
              Taro.navigateTo({ url: "/pages/customer/index/edit/index" });
            }}
          >
            添加客户
          </Button>
        )}
      </BottomBar>
    </View>
  );
};

export default Customer;

