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
import Popup from "@/components/popup";
import Button from "@/components/button";
import "./index.scss";

const AssetFlow: FC = () => {

  const stateList = [
    { label: "全部状态", value: 0 },
    { label: "等待", value: 1 },
    { label: "执行中", value: 2 },
    { label: "失败", value: 3 },
    { label: "成功", value: 4 },
    { label: "待结算", value: 5 },
    { label: "退款完成", value: 6 },
    { label: "结算完成", value: 7 }
  ];
  const flowTypeList = [
    { label: "全部类型", value: 0 },
    { label: "用户订单", value: 1 },
    { label: "企业订单", value: 2 },
    { label: "提现", value: 3 }
  ];
  const [filter, setFilter] = useState({
    balance_type: 0,
    bill_type: 0,
    flow_type: 0, // 流水号类型 1 企业商品订单 2企业订单 3提现
    state: 0 // 1等待 2执行中 3失败 4成功 5待结算 6退款完成(全部退款) 7结算完成
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
    assetsApi.fundFlow.page({ page: page, page_size: pageSize, ...filter }).then(res=>{
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

  const [popupResult, setPopupResult] = useState<any>({
    visable: false,
    title: "",
    err: false,
    type: 0,
    detail: {}
  });
  const showResultInfo = (flow_id, bill_type) => {
    getResultInfo(flow_id, bill_type);
    setPopupResult((prevState)=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = true;
      temp.err = false;
      temp.type = bill_type;
      temp.title = bill_type == 2 ? "支付结果明细" : "退款结果明细";
      return temp;
    });
  };
  const getResultInfo = (flow_id, bill_type) => {
    assetsApi.fundFlow[bill_type == 2 ? "result" : "refund"]({ flow_id: flow_id })
      .then(res => {
        if (!!res && res.code === 0) {
          setPopupResult((prevState)=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.detail = res?.data || {};
            return temp;
          });
        }else{
          setPopupResult((prevState)=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.err = true;
            return temp;
          });
        }
      })
      .catch(() => {
        setPopupResult((prevState)=>{
          let temp = JSON.parse(JSON.stringify(prevState));
          temp.err = true;
          return temp;
        });
      });
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
          options={[{ label: "全部订单", value: 0 },...shopConfig.billTypeList]}
          columns={3}
          onChange={(val)=>{handleChange(val,"bill_type");}}
        />
        <Dropdown.item
          scroll
          title="流水号类型"
          value={filter.flow_type}
          options={flowTypeList}
          columns={3}
          onChange={(val)=>{handleChange(val,"flow_type");}}
        />
        <Dropdown.item
          scroll
          title="流水号状态"
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
                        iconStyle={{ marginRight: addUnit(4) }}
                        icon={
                          item.flow_type && item.flow_type > 0 ? (
                            <Tag
                              size="small"
                              type={item.flow_type === 1 ? "info" : item.flow_type === 2 ? "primary" : "success"}
                            >
                              {item.flow_type === 1 ? "用户" : item.flow_type === 2 ? "企业" : "提现"}
                            </Tag>
                          ) : null
                        }
                        title="流水号"
                        content={item.id}
                      />
                      <Cell
                        style={{ paddingBottom: addUnit(8) }}
                        textStyle={{ color: "#999", fontSize: addUnit(10), lineHeight: addUnit(14) }}
                        title="订单类型"
                        labelStyle={{ color: "#333", fontSize: addUnit(14), marginTop: 0 }}
                        label={findLabel(item.bill_type,shopConfig.billTypeList)}
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
                            <View
                              style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: addUnit(2) }}
                            >
                              {!!item.subject ? (
                                <View style={{ color: "#999", fontSize: addUnit(10), marginRight: addUnit(6) }}>
                                  {item.subject}
                                </View>
                              ) : null}
                              <Tag
                                size="mini"
                                type={item.in_type === 1 ? "success" : "warning"}
                              >
                                {item.in_type === 1 ? "入账" : "出账"}
                              </Tag>
                            </View>
                          </React.Fragment>
                        }
                      />
                      <Cell
                        size="small"
                        textStyle={{ color: "#999" }}
                        title={secToDate(item.created_at)}
                        content={
                          <Tag
                            plain={false}
                            type={item.state === 1 || item.state === 2 || item.state === 5 ? "info" : item.state === 3 ? "warning" : item.state > 3 && item.pay_channel < 7 ? "success" : "default"}
                          >
                            {findLabel(item.state, stateList)}
                          </Tag>
                        }
                        arrow={item.state > 3 && item.pay_channel < 7}
                        onClick={()=>{
                          if(item.state > 3 && item.pay_channel < 7){
                            showResultInfo(item.id, item.bill_type);
                          }
                        }}
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
      <Popup
        show={popupResult.visable && Object.keys(popupResult.detail).length > 0}
        title={popupResult.title}
        position="pageSheet"
        bgColor="#f7f8f8"
        onClose={()=>{
          setPopupResult((prevState)=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.visable = false;
            temp.err = false;
            temp.type = 0;
            temp.title = "";
            temp.detail = {};
            return temp;
          });
        }}
        action={
          <Button
            type="info"
            style={{ width: "70%" }}
            onClick={()=>{
              setPopupResult((prevState)=>{
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.visable = false;
                temp.err = false;
                temp.type = 0;
                temp.title = "";
                temp.detail = {};
                return temp;
              });
            }}
          >
            确定
          </Button>
        }
      >
        {popupResult.type === 2 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Cell border={false} title="支付流水号" content={popupResult.detail?.id} />
              <Cell border={false} title="支付总额" content={`¥${formatPrice(popupResult.detail?.pay_amount || 0)}`} style={{ paddingTop: 0 }} />
              <Cell border={false} title="支付状态" content={popupResult.detail?.state === 1 ? "支付成功" : popupResult.detail?.state === 2 ? "支付失败" : "退款成功"} style={{ paddingTop: 0 }} />
              {popupResult.detail?.created_at ? (
                <Cell border={false} title="创建时间" content={secToDate(popupResult.detail?.created_at)} style={{ paddingTop: 0 }} />
              ) : null}
              <Cell border={false} title="通知时间" content={secToDate(popupResult.detail?.notify_time)} style={{ paddingTop: 0 }} />
            </View>
            {popupResult.detail?.bills && popupResult.detail?.bills.length > 0 ? (
              <React.Fragment>
                <View className="card-title">渠道明细</View>
                <View className="card">
                  {popupResult.detail?.bills.map((item, index)=>{
                    return (
                      <React.Fragment key={`qdmx-${index}`}>
                        <Cell title="支付渠道" content={item.fund_channel} border={index !== 0} />
                        <Cell title="支付金额" content={`¥${formatPrice(item.amount || 0)}`} border={false} style={{ paddingTop: 0 }} />
                      </React.Fragment>
                    );
                  })}
                </View>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ) : popupResult.type === 3 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Cell border={false} title="退款流水号" content={popupResult.detail?.id} />
              {popupResult.detail?.flow_id ? (
                <Cell border={false} title="退款支付流水号" content={popupResult.detail?.flow_id} style={{ paddingTop: 0 }} />
              ) : null}
              <Cell border={false} title="申请退款金额" content={`¥${formatPrice(popupResult.detail?.refund_fee || 0)}`} style={{ paddingTop: 0 }} />
              <Cell border={false} title="退款金额" content={`¥${formatPrice(popupResult.detail?.refund_amount || 0)}`} style={{ paddingTop: 0 }} />
              <Cell border={false} title="支付渠道" content={findLabel(popupResult.detail?.pay_channel, shopConfig.payList)} style={{ paddingTop: 0 }} />
              {popupResult.detail?.refund_re_account ? (
                <Cell border={false} title="退款账户" content={popupResult.detail?.refund_re_account} style={{ paddingTop: 0 }} />
              ) : null}
              <Cell border={false} title="退款状态" content={popupResult.detail?.state === 1 ? "退款成功" : popupResult.detail?.state === 2 ? "退款异常" : popupResult.detail?.state === 3 ? "退款关闭" : "异常"} style={{ paddingTop: 0 }} />
              {popupResult.detail?.created_at ? (
                <Cell border={false} title="创建时间" content={secToDate(popupResult.detail?.created_at)} style={{ paddingTop: 0 }} />
              ) : null}
              {popupResult.detail?.success_at ? (
                <Cell border={false} title="成功时间" content={secToDate(popupResult.detail?.success_at)} style={{ paddingTop: 0 }} />
              ) : null}
            </View>
            {popupResult.detail?.bills && popupResult.detail?.bills.length > 0 ? (
              <React.Fragment>
                <View className="card-title">渠道明细</View>
                <View className="card">
                  {popupResult.detail?.bills.map((item, index)=>{
                    return (
                      <React.Fragment key={`qdmx-${index}`}>
                        <Cell title="支付渠道" content={item.fund_channel} border={index !== 0} />
                        <Cell title="支付金额" content={`¥${formatPrice(item.amount || 0)}`} border={false} style={{ paddingTop: 0 }} />
                      </React.Fragment>
                    );
                  })}
                </View>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ) : (
          <Empty desc="无记录" />
        )}
      </Popup>
    </View>
  );
};

export default AssetFlow;
