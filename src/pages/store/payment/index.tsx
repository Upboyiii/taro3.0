import React, { FC, useState } from "react";
import Taro, { useLoad } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { settingApi } from "@/api/co_admin";
import { refStoreConfig } from "@/utils/app";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import "./index.scss";

export const paymentDefault = {
  WX_PAY: {
    typeValue: 1,
    logo: require("@/assets/icons/payicon/wechat.png"),
    mark: "资金结算至店铺余额，结算时扣除0.6%交易手续费（微信收取）。（仅支持境内使用，支付宝内无法使用微信支付）"
  },
  ALIPAY: {
    typeValue: 2,
    logo: require("@/assets/icons/payicon/alipay.png"),
    mark: "资金结算至店铺余额，结算时扣除0.6%交易手续费（支付宝收取）。（仅支持境内使用，微信内无法使用支付宝支付）"
  },
  ELECTRONIC: {
    typeValue: 3,
    logo: require("@/assets/icons/payicon/unionpay.png")
  },
  QQ_PAY: {
    typeValue: 4,
    logo: require("@/assets/icons/payicon/qqpay.png")
  },
  BANK_PAY: {
    typeValue: 5,
    logo: require("@/assets/icons/payicon/bank.png"),
    mark: "支付使用储蓄卡和信用卡。资金结算至店铺余额，结算时扣除0.6%交易手续费（支付机构收取）"
  },
  MARK_PAY: {
    typeValue: 11,
    logo: require("@/assets/icons/payicon/offline.png"),
    mark: "资金不过彩豚，记录至标记账户（仅针对线下收银）"
  },
  CASH_PAY: {
    typeValue: 13,
    logo: require("@/assets/icons/payicon/cashpay.png")
  },
  VALUE_PAY: {
    typeValue: 10,
    logo: require("@/assets/icons/payicon/ctpay.png")
  },
  SHOP_BALANCE: {
    typeValue: 12,
    logo: require("@/assets/icons/payicon/yuepay.png")
  },
  CASH_DISCOUNT: {
    typeValue: 14,
    logo: require("@/assets/icons/payicon/staff.png"),
    mark: "用于后台结账时，员工是否可以进行折扣优惠"
  }
};

const Payment: FC = () => {

  useLoad(() => {
    settingApi.config.menuId(23).then(res => {
      console.log(res,"res");
      if (!!res && res.code === 0) {
        const list = res?.data || [];
        let storePay: any = {};
        list.forEach(item => {
          if (item.alias === "storePay") {
            storePay = item;
          }
        });
        storePay.rule.forEach(item => {
          if (paymentDefault[item.label]) {
            item.typeValue = paymentDefault[item.label].typeValue;
            item.logo = paymentDefault[item.label].logo;
            item.mark = paymentDefault[item.label].mark;
          }
        });
        settingApi.config.sysInfo({ alias: ["fundConfig"] }).then(res => {
          if (res.code === 0 && res.data["fundConfig"] && res.data["fundConfig"]["payConfig"]) {
            let payConfig = res.data["fundConfig"]["payConfig"];
            if (payConfig.length > 0) {
              setPaymentList(storePay.rule, storePay.value, payConfig);
            }
          }
        });
      }else{
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    });
  });
  const [err, setErr] = useState(false);
  const setPaymentList = (rules, values, payConfig) => {
    rules.forEach(item => {
      item.value = values[item.label];
      payConfig.forEach(ite => {
        if (item.typeValue === ite.pay_type) {
          item.disabled = !ite.pay_use;
          item.disabledMark = ite.pay_use ? "" : ite.mark;
        }
      });
    });
    setPayment((prv: []) => {
      return [...prv, ...rules];
    });
  };
  const setPaymentConfig = async (row, val) => {
    let Obj = {};
    let list = JSON.parse(JSON.stringify(payment));
    if(!!list && list.length > 0){
      list.forEach((item,index) => {
        Obj[item.label] = item.value;
        if(index == row){
          Obj[item.label] = val;
        }
      });
    }
    await settingApi.config.save({ config:{ storePay: Obj } })
      .then((resp)=>{
        if(!!resp && resp.code === 0){
          setPayment((prv) => {
            prv[row].value = val;
            return [...prv];
          });
        }else{
          Taro.showToast({ title: resp?.message || "操作失败", icon: "error" });
        }
      });
    // 更新店铺配置缓存数据
    refStoreConfig().then();
  };

  const [payment, setPayment] = useState<any>([]);

  return (
    <React.Fragment>
      {!err ? (
        <React.Fragment>
          <View className="card" style={{ marginTop: addUnit(12) }}>
            {Object.keys(payment).map((item: any, index) => {
              if(!!payment[item].disabledMark) return null;
              return (
                <Cell
                  key={index}
                  border={index !== 0}
                  align={!!payment[item].mark || !!payment[item].disabledMark ? "start" : "center"}
                  icon={payment[item].logo}
                  iconStyle={!!payment[item].mark || !!payment[item].disabledMark ? { marginTop: addUnit(3) } : {}}
                  title={payment[item].name}
                  textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                  label={
                    !!payment[item].disabledMark ? <Tag type="primary" plain={false}>{payment[item].disabledMark}</Tag> : payment[item].mark
                  }
                  labelStyle={{
                    fontSize: addUnit(10),
                    lineHeight: addUnit(14),
                    color: payment[item].disabledMark ? "#ff2340" : "#999"
                  }}
                  extra={
                    <Switch
                      style={process.env.TARO_ENV !== "rn" ? { pointerEvents: "none" } : {}}
                      disabled={payment[item].disabled}
                      activeValue="1"
                      inactiveValue="2"
                      checked={payment[item].value === "1"}
                      onChange={(val) => {
                        setPaymentConfig(item, val);
                      }}
                    />
                  }
                  onClick={() => {
                    if (payment[item].disabled) return;
                    // setPayment(prevState => {
                    //   let temp = JSON.parse(JSON.stringify(prevState));
                    //   temp[item].value = temp[item].value === 1 ? 2 : 1;
                    //   return temp;
                    // });
                  }}
                />
              );
            })}
          </View>
        </React.Fragment>
      ) : (
        <Empty desc="加载错误，请返回重试" image="error" style={{ paddingTop: 0 }} />
      )}
    </React.Fragment>
  );
};

export default Payment;
