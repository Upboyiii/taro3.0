import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { userApi } from "@/api/user";
import { statsApi } from "@/api/stats";
import ScrollView from "@/components/scroll-view";
import shopConfig from "@/locales/shopConfig";
import store from "@/store";
import Dropdown from "@/components/dropdown";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import DateFilter from "@/components/date-fliter";
// @ts-ignore
import Tabs from "@/components/tabs";
import classnames from "classnames";
import "../asset/stats/index.scss";

const DataFlow: FC = () => {

  // @ts-ignore
  const tabs = [
    { label: "日汇总", value: "day" },
    { label: "月汇总", value: "month" }
  ];
  const [tabActive, setTabActive] = useState("day");
  // @ts-ignore
  const handelTabs = (val) => {
    const format = val === "month" ? "{y}" : "{y}-{M}";
    const today = secToDate(new Date().getTime(),format);
    handleChange(val === "day" ? 1 : 2, "state");
    handleChange(today,"start_at");
    setTabActive(val);
  };

  const { store_id, coid } = store.getState().storeInfo;
  const [storeList, setStoreList] = useState<any[]>([]);
  const getStoreList = ()=>{
    userApi.admin.adminList({ page: 1, page_size: 999, coid: coid, order_key: "+created_at" }).then(res=>{
      if(!!res && res.code === 0){
        setStoreList(res.data?.list || []);
      }
    });
  };
  useEffect(()=>{
    getStoreList();
  },[]);

  const typeList = [
    { label:"账户类型", value: 1, children: [{ label: "全部类型", value: 0 },...shopConfig.balanceTypeList] },
    { label:"支付渠道", value: 2, children: [{ label: "全部支付", value: 0 },...shopConfig.payList] },
    { label:"账单类型", value: 3, children: [{ label: "全部账单", value: 0 },...shopConfig.billTypeList] }
  ];
  const [filter, setFilter] = useState({
    stat_type: 1, // 统计类型 1账户类型 2在线支付渠道类型 3账单类型
    stat_mark: 0, //
    start_at: secToDate(new Date().getTime(),"{y}-{M}"),
    store_id: store_id,
    state: 2
  });
  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [total, setTotal] = useState<number>(0);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (val, ref) => {
    setFilter(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    console.log(page,"page");
    statsApi.access.flow({ page: page, page_size: pageSize, order_key:"-count_time", ...filter }).then(res=>{
      console.log(res,"res");
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          let list = res.data.list ? res.data.list : [];
          if(refresh){
            setPageList(list);
          }else{
            setPageList(prv => {
              return [...prv, ...list];
            });
          }
        }
      } else {
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
      setPulling(false);
    });
  };

  useEffect(() => {
    if(!!filter.start_at){
      getList(1,true);
    }
  }, [filter.store_id, filter.start_at, filter.stat_mark, filter.stat_type, filter.state]);

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let page = parseInt(val) + 1;
        getList(page);
        return page;
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

  const [bem] = createNamespace("stats","funds");

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#fff" }}>
      <Dropdown
        border="top-bottom"
        style={{ justifyContent: "space-between" }}
        // prefix={
        //   <Tabs
        //     space={10}
        //     active={tabActive}
        //     options={tabs}
        //     onChange={handelTabs}
        //     style={{ paddingLeft: addUnit(4), paddingRight: addUnit(4) }}
        //   />
        // }
      >
        <Dropdown.item
          title="店铺余额"
          value={filter.stat_mark}
          options={typeList}
          columns={2}
          style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto" }}
          hasChildren
          onChange={(val)=>{handleChange(val,"stat_mark"); }}
          menuValue={1}
          onMenuChange={(val)=>{handleChange(val,"stat_type"); }}
        />
        {storeList.length > 1 ? (
          <Dropdown.item
            title="选择店铺"
            value={filter.store_id}
            options={storeList}
            format={{ label: "name", value:"store_id" }}
            style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "56%", justifyContent: "flex-end" }}
            onChange={(val)=>{handleChange(val,"store_id"); }}
          />
        ) : null}
      </Dropdown>
      <DateFilter
        border
        type={tabActive === "day" ? "month" : "year"}
        value={filter.start_at}
        onChange={(val)=>{handleChange(val,"start_at");}}
      />
      {pageList.length > 0 ? (
        <View className={classnames(bem("item", "header"))}>
          <View className={classnames(bem("item-date"))}>时间</View>
          <View className={classnames(bem("item-in"))}>收入</View>
          <View className={classnames(bem("item-out"))}>支出</View>
          <View className="hairline hairline--bottom" />
        </View>
      ) : null}
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
            {Array(8)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    border={i !== 0}
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48,12]}
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
                    <View className={classnames(bem("item-wrap"))} key={index}>
                      <View className={classnames(bem("item"))}>
                        <View className={classnames(bem("item-date"))}>{secToDate(item.count_time, "{y}-{M}-{d}")}</View>
                        <View className={classnames(bem("item-in"))}>
                          <View className={classnames(bem("item-price","in"))}>{`+${formatPrice(item.in_amount || 0)}元`}</View>
                          <View className={classnames(bem("item-count"))}>{`${item.in_count || 0}笔`}</View>
                        </View>
                        <View className={classnames(bem("item-out"))}>
                          <View className={classnames(bem("item-price","out"))}>{`-${formatPrice(item.out_amount || 0)}元`}</View>
                          <View className={classnames(bem("item-count"))}>{`${item.out_count || 0}笔`}</View>
                        </View>
                      </View>
                      {item.refund_amount || item.refund_nums ? (
                        <View className={classnames(bem("item","refund"))}>
                          <View className={classnames(bem("item-date", "small"))}>退款</View>
                          <View className={classnames(bem("item-in"))}>
                            <View className={classnames(bem("item-price",["re","small"]))}>{`${formatPrice(item.refund_amount || 0)}元`}</View>
                          </View>
                          <View className={classnames(bem("item-out"))}>
                            <View className={classnames(bem("item-count","small"))}>{`${item.refund_nums || 0}次`}</View>
                          </View>
                        </View>
                      ) : null}
                      <View className="hairline hairline--bottom" style={{ left: addUnit(16) }} />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关明细" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default DataFlow;
