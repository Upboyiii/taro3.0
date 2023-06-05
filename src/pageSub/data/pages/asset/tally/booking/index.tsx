// @ts-ignore
import React, { FC, useState } from "react";
import Taro from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { assetsApi } from "@/api/co_admin";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { navigateTo, eventCenterTrigger } from "@/utils/library";
import { secToDate } from "@/utils/common";
import Tabs from "@/components/tabs";
import Field from "@/components/field";
import Radio from "@/components/radio";
import Cell from "@/components/cell";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const TallyBooking: FC = () => {

  const tabs = [{ label: "记收入", value: 1 }, { label: "记支出", value: 2 }];
  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setTabsActive(val);
  };

  const init = {
    amount: "", // 金额 +入账 -出账
    balance_type: 3, // 账户类型 3标记资金 7现金
    note: "" // 备注信息
  };
  const [form, setForm] = useState<any>(init);

  const handleValueChange = (val, type) =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[type] = val;
      return temp;
    });
  };

  const saveClick = () => {
    if(!form.amount){
      Taro.showToast({ title: "请输入记账金额", icon: "none" });
      return;
    }

    let _form = JSON.parse(JSON.stringify(form));
    _form.amount = parseInt(form.amount) * 100;
    _form.amount = tabsActive === 2 ? _form.amount * -1 : _form.amount;

    assetsApi.finance
      .billAdd(_form)
      .then(res => {
        if (res.code === 0) {
          eventCenterTrigger("tally");
          navigateTo({ method:"navigateBack" });
          // navigateTo({ method:"navigateTo",url: "/pages/data/asset/tally/records/index?type=" + form.balance_type });
        }
      });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: addUnit(14)
            }}
          >
            <Tabs active={tabsActive} options={tabs} onChange={handelTabs} space={12} />
            <View style={{ fontSize: addUnit(14), color: "#333" }}>
              {secToDate(new Date().getTime(), "{y}年{M}月{d}日")}
            </View>
          </View>
          <Field
            type="number"
            style={{ marginTop: addUnit(10) }}
            title={tabsActive === 1 ? "收入金额" : "支出金额"}
            titleRow
            icon={<View style={{ fontSize: addUnit(32) }}>¥</View>}
            inputStyle={!!form.amount ? { fontSize: addUnit(32) } : { fontSize: addUnit(22) }}
            placeholder="请输入金额"
            value={form.amount}
            onChange={(val)=>{
              handleValueChange(val, "amount");
            }}
          />
          <Cell
            title="账本"
            contentStyle={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <Radio
              plain
              size="small"
              type="button"
              label="标记资金"
              checked={form.balance_type === 3}
              value={3}
              onChange={(val)=>{
                handleValueChange(val,"balance_type");
              }}
            />
            <Radio
              style={{ marginLeft: addUnit(12) }}
              plain
              size="small"
              type="button"
              label="现金"
              checked={form.balance_type === 7}
              value={7}
              onChange={(val)=>{
                handleValueChange(val,"balance_type");
              }}
            />
          </Cell>
          <Field
            title="备注"
            titleRow
            placeholder="请输入备注"
            maxlength={50}
            showWordLimit
            value={form.note}
            onChange={(val)=>{
              handleValueChange(val, "note");
            }}
          />
        </View>
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default TallyBooking;
