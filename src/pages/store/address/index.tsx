import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { settingApi } from "@/api/co_admin";
import { cityData } from "@/components/city-select/cityDate";
import { eventCenterOff, eventCenterOn } from "@/utils/library";
import { addUnit } from "@/components/utils";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

let Level = 0;
const Address: FC = () => {
  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [addressList, setAddressList] = useState<any>([]);  // 退货地址数据
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { label: "退货地址", value: 1 },
    { label: "收票地址", value: 2 },
    { label: "发货地址", value: 3 }
  ];

  useEffect(() => {
    getAddressPage(page, 1, true);
    eventCenterOn("addressEdit", () => {
      getAddressPage(page, 1, true);
    });
    return () => {
      eventCenterOff("addressEdit");
    };
  }, []);

  // 获取退货地址库数据
  const getAddressPage = (page, type, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setAddressList([]);
      setLoading(true);
    }
    settingApi.address.page({ page: page, page_size: pageSize, order_key: "-created_at", type: type }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data.total || 0);
          let list = res.data.list ? res.data.list : [];
          setAddressList(prv => {
            return [...prv, ...list];
          });
        }else{
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

  const [addressType, setAdressType] = useState(1);
  const renderDefault = (link) => {
    if (!!link && link.length > 0) {
      let hasDefault = false;
      link.forEach(item => {
        if (item.type === addressType && item.default === 2) hasDefault = true;
      });
      if(hasDefault){
        return <Tag type="primary" size="small" style={{ marginLeft: 6 }}>默认地址</Tag>;
      }
    }
    return null;
  };

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let page = parseInt(val) + 1;
        getAddressPage(page, tabsActive);
        return page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      handelTabs(1);
    },500);
  };

  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setPage(1);
    setAdressType(val);
    setTabsActive(val);
    getAddressPage(1, val, true);
  };

  const renderAddress = (county_id) => {
    let adr = "";
    for (let i = 0; i < cityData.length; i++) {
      const item = cityData[i];
      if (!item.children) {
        continue;
      }
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        if (child.id === county_id) {
          Level = 1;
          adr = item.label + "" + child.label;
        }
        if (!child.children) {
          continue;
        }
        for (let k = 0; k < child.children.length; k++) {
          const grandchild = child.children[k];
          if (grandchild.id === county_id) {
            Level = 2;
            adr = item.label + "" + child.label + "" + grandchild.label;
          }
        }
      }
    }
    return Level === 1 ? adr : (Level === 2 ? adr : "");
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Tabs active={tabsActive} options={tabs} onChange={handelTabs} bgColor="#fff" border />
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
      >
        {loading ? (
          <React.Fragment>
            {Array(5)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    image
                    imageShape="round"
                    imageSize={40}
                    title
                    row={1}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {addressList.length > 0 ? (
              <React.Fragment>
                {addressList.map((item: any, index) => {
                  if (item)
                    return (
                      <View className="card" key={`address-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                        <Cell
                          border={index !== 0}
                          style={{ paddingBottom: 16 }}
                          title={
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                              <Text style={{ color: "#333", fontSize: 17, fontWeight: "bold" }}>{item.name}</Text>
                              <Text style={{ color: "#666", fontSize: 14 }}> - {item.phone}</Text>
                              {renderDefault(item.link)}
                            </View>
                          }
                          label={`${renderAddress(item.county_id)} ${item.address}`}
                          labelStyle={{ color: "#666", fontSize: 14, marginTop: 6 }}
                          arrow
                          onClick={() => {
                            Taro.navigateTo({ url: `/pages/store/address/edit/index?id=${item.id}` });
                          }}
                        />
                      </View>
                    );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关地址" image="address" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: `/pages/store/address/edit/index?tabsActive=${tabsActive}` });
          }}
        >
          新增地址
        </Button>
      </BottomBar>
    </View>
  );
};

export default Address;
