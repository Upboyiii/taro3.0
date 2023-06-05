import React, { FC, useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { assetsApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
import Button from "@/components/button";
import Tag from "@/components/tag";
import Popup from "@/components/popup";
import classnames from "classnames";
import "./index.scss";

const Balance: FC = () => {

  const [loading, setLoading] = useState(false);
  const [finance, setFinance] = useState({
    balance: 0,
    wait_balance: 0,
    not_balance: 0
  });

  const getFinance = () => {
    setLoading(true);
    assetsApi.finance.balance({ type: 1 })
      .then(res => {
        if (res.code === 0) {
          setFinance({
            balance: res.data?.balance || 0,
            wait_balance: res.data?.wait_balance || 0,
            not_balance: res.data?.not_balance || 0
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(()=>{
    getFinance();
  },[]);

  const [help, setHelp] = useState(false);

  const [bem] = createNamespace("page","balance");
  return (
    <View className={classnames(bem())}>
      <React.Fragment>
        <View className={classnames(bem("header"))}>
          <View className={classnames(bem("title"))}>店铺余额</View>
          <View className={classnames(bem("balance"))}>
            <Text className={classnames(bem("balance-currency"))}>¥</Text>
            <Text className={classnames(bem("balance-nums"))}>
              {!loading ? formatPrice(finance.balance) : "-.--"}
            </Text>
          </View>
        </View>
        <View className={classnames(bem("other"))} onClick={()=>{setHelp(true);}}>
          <View className={classnames(bem("item"))}>
            <Text className={classnames(bem("item-label"))}>不可用店铺余额</Text>
            <Text className={classnames(bem("item-nums"))}>
              {!loading ? formatPrice(finance.not_balance) : "-.--"}
            </Text>
            <Text className={classnames(bem("item-label"))}>元</Text>
            <Tag className={classnames(bem("help-icon"))} round>?</Tag>
          </View>
          <View className={classnames(bem("item"))}>
            <Text className={classnames(bem("item-label"))}>待结算金额</Text>
            <Text className={classnames(bem("item-nums"))}>
              {!loading ? formatPrice(finance.wait_balance) : "-.--"}
            </Text>
            <Text className={classnames(bem("item-label"))}>元</Text>
            <Tag className={classnames(bem("help-icon"))} round>?</Tag>
          </View>
        </View>
        <View className={classnames(bem("action"))}>
          <Button
            type="primary"
            size="medium"
            onClick={()=>{
              navigateTo({ method: "navigateTo", url: "/pages/data/asset/recharge/index" });
            }}
          >
            充值
          </Button>
          <Button
            style={{ marginTop: addUnit(24) }}
            type="primary"
            size="medium"
            plain
            onClick={()=>{
              navigateTo({ method: "navigateTo", url: "/pages/data/asset/withdraw/index" });
            }}
          >
            提现
          </Button>
        </View>
      </React.Fragment>
      <Popup
        show={help}
        title="店铺余额说明"
        scroll={false}
        onClose={()=>{setHelp(false);}}
        action={
          <Button type="primary" style={{ width: "70%" }} onClick={()=>{setHelp(false);}}>我知道啦</Button>
        }
      >
        <View className={classnames(bem("help"))}>
          <View className={classnames(bem("help-title"))}>· 可用店铺余额</View>
          <View className={classnames(bem("help-desc"))}>
            可用店铺余额=店铺余额-不可用店铺余额
          </View>
          <View className="hairline hairline--bottom" style={{ left: addUnit(30) }} />
        </View>
        <View className={classnames(bem("help"))}>
          <View className={classnames(bem("help-title"))}>· 不可用店铺余额</View>
          <View className={classnames(bem("help-desc"))}>
            提现中或者退款中的冻结店铺余额
          </View>
          <View className="hairline hairline--bottom" style={{ left: addUnit(30) }} />
        </View>
        <View className={classnames(bem("help"))}>
          <View className={classnames(bem("help-title"))}>· 待结算金额</View>
          <View className={classnames(bem("help-desc"))}>
            交易未完成的订单总额，消费者确认收货后将自动转入店铺余额
          </View>
          <View className="hairline hairline--bottom" style={{ left: addUnit(30) }} />
        </View>
        <View className={classnames(bem("help"))}>
          <View className={classnames(bem("help-desc", "small"))}>
            可以在电脑端 资产总览查看不可以用店铺余额和待结算金额的相关明细。
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default Balance;
