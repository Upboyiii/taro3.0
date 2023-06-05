import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { assetsApi } from "@/api/co_admin";
import { formatPrice, secToDate } from "@/utils/common";
import shopConfig from "@/locales/shopConfig";
import ScrollView from "@/components/scroll-view";
import Tabs from "@/components/tabs";
import Dropdown from "@/components/dropdown";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import DateFilter from "@/components/date-fliter";
import classnames from "classnames";
import "./index.scss";

const AssetStats: FC = () => {

  const tabs = [
    { label: "日汇总", value: "day" }
    // { label: "月汇总", value: "month" }
    // { label: "年汇总", value: "year" }
  ];
  const [tabActive, setTabActive] = useState("day");
  const handelTabs = (val) => {
    handleChange(val, "name");
    setTabActive(val);
    const format = val === "month" ? "{y}" : "{y}-{M}";
    const today = secToDate(new Date().getTime(),format);
    setDate(val === "year" ? "" : today);
  };

  const getDate = (type, tab, date = "") => {
    const now = !!date ? new Date(date) : new Date();
    const now_year = now.getFullYear();
    let now_month:any = now.getMonth() + 1;
    now_month = now_month < 10 ? "0" + now_month : now_month;
    let now_day:any = new Date(now.getFullYear(),now.getMonth() + 1,0).getDate();
    now_day = now_day < 10 ? "0" + now_day : now_day;
    if(tab === "day"){
      if(type === "start"){
        return now_year + "-" + now_month + "-01";
      }
      if(type === "end"){
        return now_year + "-" + now_month + "-" + now_day;
      }
    }else{
      if(type === "start"){
        return now_year + "-01-01";
      }
      if(type === "end"){
        return now_year + "-12-31";
      }
    }
    return "";
  };

  const [date, setDate] = useState(secToDate(new Date().getTime(),"{y}-{M}"));
  const [filter, setFilter] = useState({
    balance_type: 1,
    name: "day",
    start_time: getDate("start","day"),
    end_time: getDate("end","day")
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

  const getList = (page, refresh = false, start = "", end = "") => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    const obj = {
      balance_type: filter.balance_type,
      name: filter.name,
      start_time: !!start ? start : filter.start_time,
      end_time: !!end ? end : filter.end_time
    };
    assetsApi.fundBill.stats({ page: page, page_size: pageSize, ...obj }).then(res=>{
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
      setPulling(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    const start = getDate("start", tabActive, date);
    const end = getDate("end", tabActive, date);
    getList(1,true, start, end);
    if(tabActive !== "year"){
      setFilter(prevState => {
        let temp = JSON.parse(JSON.stringify(prevState));
        temp.start_time = start;
        temp.end_time = end;
        return temp;
      });
    }
  }, [filter.balance_type, date]);

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
        prefix={
          <Tabs
            space={10}
            active={tabActive}
            options={tabs}
            onChange={handelTabs}
            style={{ paddingLeft: addUnit(4), paddingRight: addUnit(4) }}
          />
        }
      >
        <Dropdown.item
          title="店铺余额"
          value={filter.balance_type}
          options={shopConfig.balanceTypeList}
          columns={3}
          style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto" }}
          onChange={(val)=>{handleChange(val,"balance_type");}}
        />
      </Dropdown>
      {!!date ? <DateFilter type={tabActive === "day" ? "month" : "year"} value={date} onChange={setDate} /> : null}
      <View className={classnames(bem("item", "header"))}>
        <View className={classnames(bem("item-date"))}>日期</View>
        <View className={classnames(bem("item-in"))}>收入</View>
        <View className={classnames(bem("item-out"))}>支出</View>
        <View className="hairline hairline--bottom" />
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
                    <View
                      key={index}
                      className={classnames(bem("item"))}
                    >
                      <View className={classnames(bem("item-date"))}>{secToDate(item.count_time, "{y}-{M}-{d}")}</View>
                      <View className={classnames(bem("item-in"))}>
                        <View className={classnames(bem("item-price","in"))}>{`+${formatPrice(item.in_amount || 0)}元`}</View>
                        <View className={classnames(bem("item-count"))}>{`${item.in_count || 0}笔`}</View>
                      </View>
                      <View className={classnames(bem("item-out"))}>
                        <View className={classnames(bem("item-price","out"))}>{`-${formatPrice(item.out_amount || 0)}元`}</View>
                        <View className={classnames(bem("item-count"))}>{`${item.out_count || 0}笔`}</View>
                      </View>
                      <View className="hairline hairline--bottom" style={{ borderColor: "#eee", left: addUnit(16) }} />
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

export default AssetStats;
