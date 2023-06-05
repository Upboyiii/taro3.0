import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import shopConfig from "@/locales/shopConfig";
import { config, findLabel } from "@/pages/order/utils/config";
import Cell from "@/components/cell";
import Field from "@/components/field";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const OrderFilter: FC = () => {
  const _form = getCurrentInstance().router?.params?.form;
  const _refs = getCurrentInstance().router?.params?.refs;

  const [filter, setFilter] = useState<any>(config.userOrder.filterInit);
  const handleFilterChange = (val, ref) => {
    setFilter(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  useEffect(()=>{
    let init = config.userOrder.filterInit;
    if(_refs === "companyOrder"){
      // @ts-ignore
      init = config.companyOrder.filterInit;
    }
    if(_refs === "serviceOrder"){
      // @ts-ignore
      init = config.serviceOrder.filterInit;
    }
    if(_refs === "afterSale"){
      // @ts-ignore
      init = config.afterSale.filterInit;
    }
    if(_form){
      setFilter(() => {
        return Object.assign({}, init, JSON.parse(_form));
      });
    }
  },[]);

  const resetFilter = () => {
    let init = config.userOrder.filterInit;
    if(_refs === "companyOrder"){
      // @ts-ignore
      init = config.companyOrder.filterInit;
    }
    if(_refs === "serviceOrder"){
      // @ts-ignore
      init = config.serviceOrder.filterInit;
    }
    if(_refs === "afterSale"){
      // @ts-ignore
      init = config.afterSale.filterInit;
    }
    setFilter(() => {
      return Object.assign({}, init);
    });
  };
  const saveFilter = () => {
    eventCenterTrigger(_refs, filter);
    navigateTo({ method:"navigateBack" });
  };

  const [bem] = createNamespace("filter","order");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          {_refs === "userOrder" || _refs === "afterSale" ? (
            <React.Fragment>
              <Field
                border={false}
                clearable
                type="digit"
                titleWidth={70}
                title="用户ID"
                placeholder="请输入用户ID（选填）"
                value={filter.customer_id}
                onChange={(val)=>{
                  handleFilterChange(val, "customer_id");
                }}
              />
              <Field
                clearable
                type="digit"
                title="订单号"
                titleWidth={70}
                placeholder="请输入订单号（选填）"
                value={filter.order_id}
                onChange={(val)=>{
                  handleFilterChange(val, "order_id");
                }}
              />
            </React.Fragment>
          ) : null}
          {_refs === "serviceOrder" ? (
            <React.Fragment>
              <Field
                border={false}
                clearable
                title="服务名称"
                titleWidth={70}
                placeholder="请输入服务名称（选填）"
                value={filter.subject}
                onChange={(val)=>{
                  handleFilterChange(val, "subject");
                }}
              />
            </React.Fragment>
          ) : null}
          {(_refs === "afterSale") ? (
            <React.Fragment>
              <Field
                clearable
                type="tel"
                title="联系电话"
                titleWidth={70}
                placeholder="请输入联系电话"
                value={filter.phone}
                onChange={(val)=>{
                  handleFilterChange(val, "phone");
                }}
              />
              <Picker
                mode="selector"
                range={config.afterSale.typeList.map(item=>item.label)}
                onChange={(e)=>{
                  const index = e.detail.value;
                  const value = config.afterSale.typeList[index].value;
                  handleFilterChange(value, "type");
                }}
              >
                <Cell
                  title="售后类型"
                  titleStyle={{ width: addUnit(70) }}
                  contentAlign="left"
                  contentStyle={{ color: findLabel(filter.type, config.afterSale.typeList) ? "#333" : "#ccc" }}
                  content={findLabel(filter.type, config.afterSale.typeList) || "请选择"}
                  arrow
                />
              </Picker>
            </React.Fragment>
          ) : (
            <Field
              title="下单时间"
              titleWidth={70}
              input={false}
              inputStyle={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <View className={classnames(bem("date"))}>
                <Picker
                  mode="date"
                  start={secToDate(new Date(2020,0,1).getTime(),"{y}-{M}-{d}")}
                  end={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  value={filter.start_at_time}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleFilterChange(time,"start_at_time");
                  }}
                >
                  <View  className={classnames(bem("date-item",{ placeholder: !filter.start_at_time }))}>
                    {filter.start_at_time || "开始日期"}
                  </View>
                </Picker>
              </View>
              <View className={classnames(bem("date-sep"))}>至</View>
              <View className={classnames(bem("date"))}>
                <Picker
                  mode="date"
                  start={secToDate(new Date(2020,0,1).getTime(),"{y}-{M}-{d}")}
                  end={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  value={filter.end_at_time}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleFilterChange(time,"end_at_time");
                  }}
                >
                  <View  className={classnames(bem("date-item",{ placeholder: !filter.end_at_time }))}>
                    {filter.end_at_time || "结束日期"}
                  </View>
                </Picker>
              </View>
            </Field>
          )}
        </View>
        {_refs === "companyOrder" || _refs === "userOrder" ? (
          <View className="card">
            {_refs === "companyOrder" ? (
              <Picker
                mode="selector"
                range={config.companyOrder.typeList.map(item=>item.label)}
                onChange={(e)=>{
                  const index = e.detail.value;
                  const value = config.companyOrder.typeList[index].value;
                  handleFilterChange(value, "type");
                }}
              >
                <Cell
                  border={false}
                  title="订单类型"
                  titleStyle={{ width: addUnit(70) }}
                  contentAlign="left"
                  contentStyle={{ color: findLabel(filter.type, config.companyOrder.typeList) ? "#333" : "#ccc" }}
                  content={findLabel(filter.type, config.companyOrder.typeList) || "请选择"}
                  arrow
                />
              </Picker>
            ) : _refs === "userOrder" ? (
              <Picker
                mode="selector"
                range={config.userOrder.typeList.map(item=>item.label)}
                onChange={(e)=>{
                  const index = e.detail.value;
                  const value = config.userOrder.typeList[index].value;
                  handleFilterChange(value, "type");
                }}
              >
                <Cell
                  border={false}
                  title="订单类型"
                  titleStyle={{ width: addUnit(70) }}
                  contentAlign="left"
                  contentStyle={{ color: findLabel(filter.type, config.userOrder.typeList) ? "#333" : "#ccc" }}
                  content={findLabel(filter.type, config.userOrder.typeList) || "请选择"}
                  arrow
                />
              </Picker>
            ) : null}
            <Picker
              mode="selector"
              range={[{ label: "全部支付", value: 0 },...shopConfig.payList].map(item=>item.label)}
              onChange={(e)=>{
                const index = e.detail.value;
                const value = [{ label: "全部支付", value: 0 },...shopConfig.payList][index].value;
                handleFilterChange(value, "pay_channel");
              }}
            >
              <Cell
                title="支付方式"
                titleStyle={{ width: addUnit(70) }}
                contentAlign="left"
                contentStyle={{ color: findLabel(filter.pay_channel, [{ label: "全部支付", value: 0 },...shopConfig.payList]) ? "#333" : "#ccc" }}
                content={findLabel(filter.pay_channel, [{ label: "全部支付", value: 0 },...shopConfig.payList]) || "请选择"}
                arrow
              />
            </Picker>
            <Picker
              mode="selector"
              range={[{ label: "全部平台", value: 0 },...shopConfig.platformList].map(item=>item.label)}
              onChange={(e)=>{
                const index = e.detail.value;
                const value = [{ label: "全部平台", value: 0 },...shopConfig.platformList][index].value;
                handleFilterChange(value, "platform");
              }}
            >
              <Cell
                title="平台来源"
                titleStyle={{ width: addUnit(70) }}
                contentAlign="left"
                contentStyle={{ color: findLabel(filter.platform, [{ label: "全部平台", value: 0 },...shopConfig.platformList]) ? "#333" : "#ccc" }}
                content={findLabel(filter.platform, [{ label: "全部平台", value: 0 },...shopConfig.platformList]) || "请选择"}
                arrow
              />
            </Picker>
          </View>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          plain
          style={{ flex: 1, marginRight: addUnit(12) }}
          onClick={resetFilter}
        >
          重置
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={saveFilter}
        >
          确定
        </Button>
      </BottomBar>
    </View>
  );
};

export default OrderFilter;
