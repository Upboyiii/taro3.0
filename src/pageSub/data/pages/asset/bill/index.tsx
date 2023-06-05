import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { assetsApi } from "@/api/co_admin";
import { formatPrice, secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import shopConfig from "@/locales/shopConfig";
import Dropdown from "@/components/dropdown";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import "./index.scss";

const AssetBill: FC = () => {

  const stateList = [
    { label: "全部状态", value: 0 },
    { label: "待结算", value: 1 },
    { label: "交易成功", value: 2 },
    { label: "交易关闭", value: 3 }
  ];
  const [filter, setFilter] = useState({
    balance_type: 0, // 账户 0全部 1店铺余额 2储值资金 3标记资金 4保证金 5营销资金 6店铺收益
    bill_type: 0, // 类型
    in_type: 0, // 出入帐 1入账 2出账
    out_biz_no: null, // 业务单号
    pay_channel: 0, // 支付方式 1微信支付 2支付宝 3银行卡 4QQ支付 5储值资金 6线下标记
    state: 0 // 状态 0创建 1待结算 2交易成功 3交易关闭
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
    assetsApi.fundBill.page({ page: page, page_size: pageSize, ...filter }).then(res=>{
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          let list = res.data.list ? res.data.list : [];
          setPageList(prv => {
            return [...prv, ...list];
          });
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
    getList(1,true);
  }, [filter]);

  const findLabel = (value, list:any[] = []) => {
    if (value && list.length > 0) {
      const item:any = list.find((item:any) => {
        return value === item.value;
      });
      if (item) return item.label;
    }
    return "-";
  };

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

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Dropdown border="top-bottom" scroll>
        <Dropdown.item
          title="账户类型"
          value={filter.balance_type}
          options={[{ label: "全部账户", value: 0 },...shopConfig.balanceTypeList]}
          columns={3}
          onChange={(val)=>{handleChange(val,"balance_type");}}
        />
        <Dropdown.item
          scroll
          title="订单类型"
          value={filter.bill_type}
          options={[{ label: "全部类型", value: 0 },...shopConfig.billTypeList]}
          columns={3}
          onChange={(val)=>{handleChange(val,"bill_type");}}
        />
        <Dropdown.item
          scroll
          title="支付方式"
          value={filter.pay_channel}
          options={[{ label: "全部支付", value: 0 },...shopConfig.payList]}
          columns={3}
          onChange={(val)=>{handleChange(val,"pay_channel");}}
        />
        <Dropdown.item
          scroll
          title="出入账"
          value={filter.in_type}
          options={shopConfig.inTypeList}
          columns={1}
          onChange={(val)=>{handleChange(val,"in_type");}}
        />
        <Dropdown.item
          scroll
          title="账单状态"
          value={filter.state}
          options={stateList}
          columns={1}
          onChange={(val)=>{handleChange(val,"state");}}
        />
      </Dropdown>
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
                  <View key={i} className="card" style={i === 0 ? { marginTop: addUnit(12) } : {}}>
                    <Skeleton
                      title
                      align="start"
                      titleSize={[120, 24]}
                      row={1}
                      rowWidth={160}
                      action
                      actionSize={[48,12]}
                    />
                    <Skeleton
                      border
                      title
                      align="start"
                      titleSize={[120, 24]}
                      row={1}
                      rowWidth={160}
                      action
                      actionSize={[48,12]}
                    />
                  </View>
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {pageList.length > 0 ? (
              <React.Fragment>
                {pageList.map((item: any, index) => {
                  return (
                    <View key={index} className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}} >
                      <Cell
                        size="small"
                        title="业务单号"
                        content={item.out_biz_no}
                      />
                      <Cell
                        style={{ paddingBottom: addUnit(8) }}
                        textStyle={{ color: "#999", fontSize: addUnit(10), lineHeight: addUnit(14) }}
                        title="账户类型"
                        labelStyle={{ color: "#333", fontSize: addUnit(14), marginTop: 0 }}
                        label={findLabel(item.bill_type,shopConfig.billTypeList)}
                        // content={findLabel(item.balance_type, shopConfig.balanceTypeList)}
                        content={
                          <React.Fragment>
                            <View style={{ fontSize: addUnit(10), color: "#999" }}>账户类型</View>
                            <View style={{ fontSize: addUnit(14), color: "#333", marginTop: addUnit(2) }}>
                              {findLabel(item.balance_type, shopConfig.balanceTypeList)}
                            </View>
                          </React.Fragment>
                        }
                      />
                      <Cell
                        border={false}
                        style={{ paddingTop: 0 }}
                        textStyle={{ color: "#999", fontSize: addUnit(10), lineHeight: addUnit(14) }}
                        title="支付方式"
                        labelStyle={{ color: "#333", fontSize: addUnit(14), marginTop: 0 }}
                        label={findLabel(item.pay_channel, shopConfig.payList)}
                        content={
                          <React.Fragment>
                            <View style={{ color: item.in_type === 2 ? "#ff2340" : "#333", fontSize: addUnit(16), fontWeight: "bold" }}>
                              {formatPrice(item.amount)}
                            </View>
                            <View style={{ fontSize: addUnit(11), color: "#999" }}>{`余额${formatPrice(item.balance || 0)}`}</View>
                          </React.Fragment>
                        }
                      />
                      <Cell
                        size="small"
                        textStyle={{ color: "#999" }}
                        title={secToDate(item.created_at)}
                        content={
                          <Tag plain={false} type={item.state === 1 ? "info" : "default"}>
                            {findLabel(item.state, stateList)}
                          </Tag>
                        }
                      />
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

export default AssetBill;
