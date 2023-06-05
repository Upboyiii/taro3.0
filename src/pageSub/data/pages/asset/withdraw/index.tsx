// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { assetsApi, settingApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
import store from "@/store";
import Cell from "@/components/cell";
import Field from "@/components/field";
import Button from "@/components/button";
import NavBar from "@/components/navbar";
import Popup from "@/components/popup";
import Empty from "@/components/empty";
import Radio from "@/components/radio";
import Tag from "@/components/tag";
import "./index.scss";

export const bankLogo = {
  1: require("@/assets/banks/1.png"),
  2: require("@/assets/banks/2.png"),
  3: require("@/assets/banks/3.png"),
  4: require("@/assets/banks/4.png"),
  5: require("@/assets/banks/5.png"),
  6: require("@/assets/banks/6.png"),
  7: require("@/assets/banks/7.png"),
  8: require("@/assets/banks/8.png"),
  9: require("@/assets/banks/9.png"),
  12: require("@/assets/banks/12.png"),
  13: require("@/assets/banks/13.png"),
  14: require("@/assets/banks/14.png"),
  15: require("@/assets/banks/15.png"),
  16: require("@/assets/banks/16.png"),
  18: require("@/assets/banks/18.png"),
  alipay: require("@/assets/banks/alipay.png"),
  wechat: require("@/assets/banks/wechat.png")
};

const Withdraw: FC = () => {

  const { storeInfo } = store.getState();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [bankName, setBankName] = useState("");
  const [bankList, setBankList] = useState<any[]>([]);
  const [bankShow, setBankShow] = useState(false);
  const [fundConfig, setFundConfig] = useState<any>({
    cashMin: 0,
    cashMax: 50000
  });

  const getFundConfig = () => {
    setLoading(true);
    settingApi.config.sysInfo({ alias: ["fundConfig"] })
      .then(res => {
        if (res?.code === 0 && res?.data && res?.data["fundConfig"]) {
          let fundConfig = res.data["fundConfig"];
          setFundConfig({
            cashMin: fundConfig?.minCash || 0,
            cashMax: fundConfig?.maxCash || 50000
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getFinance = () => {
    setLoading(true);
    assetsApi.finance.balance({ type: 1 })
      .then(res => {
        if (res.code === 0) {
          setBalance(res.data?.balance || 0);
          handleChange(res?.data?.bank_id, "bank_id");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getBankList = () => {
    setLoading(true);
    assetsApi.banks.list()
      .then(res => {
        if (res.code === 0) {
          setBankList(res?.data?.list || []);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(()=>{
    getFundConfig();
    getFinance();
    getBankList();
  },[]);

  const [form, setForm] = useState({
    balance_type: 1, // 账户类型 1店铺余额 4保证金 5营销资金 6店铺收益 7广告投放金
    money: null,
    bank_id: null,
    msg_code: "",
    msg_id: "",
    note: "", // 提现备注
    state: 1, // 1 启用自动提现，2 停用
    err: "",
    bankErr: ""
  });
  const handleChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      // if(ref === "money"){
      //   if(!!val && parseInt(val) * 100 >= balance){
      //     val = (balance / 100).toFixed(2);
      //   };
      //   // temp.err = !val ? "请输入要提现的金额" : "";
      // }
      temp[ref] = val;
      return temp;
    });
  };
  const formatBankName = () => {
    if(form.bank_id){
      const item:any = bankList.find(item=>item.id === form.bank_id);
      if(item && item.state === 1){
        setBankName(item?.account_no || "");
      }else{
        setBankName("");
        handleChange(null, "bank_id");
      }
    }
  };

  useEffect(()=>{
    formatBankName();
  },[form.bank_id]);

  const saveWithdraw = () => {
    let verify = true;
    console.log(form,"form");
    if(!form.bank_id){
      Taro.showToast({ title: "请选择提现账户", icon: "none" });
      // handleChange("请选择提现账户","bankErr");
      verify = false;
      return;
    }
    if(!form.money){
      Taro.showToast({ title: "提现金额不能为空", icon: "none" });
      // handleChange("提现金额不能为空","err");
      verify = false;
      return;
    }else{
      if(form.money < 1){
        Taro.showToast({ title: "提现金额不可少于1元", icon: "none" });
        // handleChange("提现金额不能为空","err");
        verify = false;
        return;
      }
      if(form.money * 100 > balance){
        Taro.showToast({ title: "提现金额不能大于账户余额", icon: "none" });
        // handleChange("提现金额不能为空","err");
        verify = false;
        return;
      }
    }
    if(!verify) return;

    let _form = {
      balance_type: form.balance_type,
      money: (form.money || 0) * 100,
      bank_id: form.bank_id,
      msg_code: "1",
      msg_id: "1",
      note: form.note
    };

    assetsApi.finance
      .withdraw(_form)
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          getFinance();
          Taro.showToast({ title:"提现成功",icon: "success" });
          navigateTo({ method: "navigateTo", url: "/pages/data/asset/withdraw/records/index" });
        }
      });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <NavBar
        title="提现"
        bgColor="#f7f8f8"
        right="提现记录"
        rightStyle={{ color: "#333", fontWeight: "bold" }}
        onClickRight={()=>{
          navigateTo({ method: "navigateTo", url: "/pages/data/asset/withdraw/records/index" });
        }}
      />
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <Field
          border={false}
          title="店铺名称"
          input={false}
          inputAlign="right"
          inputStyle={{ color: "#666" }}
          value={!loading ? storeInfo.name : "-"}
        />
        <Field
          title="可提现金额"
          input={false}
          inputAlign="right"
          inputStyle={{ color: "#ff2340", fontSize: addUnit(16) }}
          value={!loading ? `${formatPrice(balance)}元` : "-.--"}
        />
      </View>
      <View className="card">
        <Field
          title="提现账户"
          input={false}
          inputAlign="right"
          placeholder="请选择提现账户"
          value={bankName}
          errorIcon={false}
          error={!!form.bankErr}
          errorMessage={form.bankErr}
          arrow
          onClick={()=>{setBankShow(true);}}
        />
        <Field
          type="number"
          title="提现金额"
          titleRow
          icon={<View style={{ fontSize: addUnit(32) }}>¥</View>}
          inputStyle={!!form.money ? { fontSize: addUnit(32) } : { fontSize: addUnit(22) }}
          placeholder="输入金额"
          value={form.money}
          errorIcon={false}
          error={!!form.err}
          errorMessage={form.err}
          intro={`${fundConfig.cashMin > 0 ? `${fundConfig.cashMin.toFixed(2)}元起提，` : ""}单笔最大可提现${fundConfig.cashMax.toFixed(2)}元`}
          introPosition="bottom"
          introStyle={{ marginTop: addUnit(12) }}
          onChange={(val)=>{
            handleChange(val, "money");
          }}
        />
      </View>
      <View className="card">
        <Field
          border={false}
          type="textarea"
          title="提现备注"
          inputAlign="right"
          placeholder="最多输入50个字符"
          maxlength={50}
          showWordLimit
          value={form.note}
          onChange={(val)=>{
            handleChange(val, "note");
          }}
        />
      </View>
      <View className="bottom-bar">
        <Button
          style={{ width: "70%" }}
          size="medium"
          type="primary"
          onClick={saveWithdraw}
        >
          确认提现
        </Button>
      </View>
      <Popup
        show={bankShow}
        title="选择提现账户"
        bgColor="#f7f8f8"
        onClose={()=>{setBankShow(false);}}
      >
        {bankList.length > 0 ? (
          <View className="card">
            {bankList.map((item, index)=>{
              return (
                <Cell
                  key={item.id}
                  border={index !== 0}
                  iconSize={32}
                  icon={bankLogo[item.type === 1 ? "wechat" : item.type === 2 ? "alipay" : item.bank_type]}
                  title={item.account_no}
                  labelStyle={{ display: "flex", flexDirection: "row" }}
                  label={
                    <React.Fragment>
                      <Tag
                        size="small"
                        type={item.metric === 1 ? "warning" : "info"}
                      >
                        {item.metric === 1 ? "私人账户" : "公司账户"}
                      </Tag>
                      {item.state === 2 || item.state === 3 ? (
                        <Tag size="small" type="primary" style={{ marginLeft: addUnit(6) }}>
                          {item.state === 2 ? "账户异常" : "未激活"}
                        </Tag>
                      ) : null}
                    </React.Fragment>
                  }
                  onClick={()=>{
                    if(item.state > 1) return;
                    handleChange(item.id, "bank_id");
                    setBankShow(false);
                  }}
                >
                  <Radio
                    disabled={item.state > 1}
                    checked={form.bank_id === item.id}
                    onChange={()=>{
                      handleChange(item.id, "bank_id");
                      setBankShow(false);
                    }}
                  />
                </Cell>
              );
            })}
          </View>
        ) : (
          <Empty title="暂无提现账户" desc="请在电脑端设置提现账户" />
        )}
      </Popup>
    </View>
  );
};

export default Withdraw;
