import React, { FC,useEffect, useState } from "react";
import Taro, { useRouter } from "@tarojs/taro";
import { View, ScrollView, Image } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatPrice } from "@/utils/common";
import { customerApi, orderApi } from "@/api/co_admin";
import { closeScene, connectScene } from "@/utils/socket";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { QRCodeImg } from "qrcode-react-native";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Radio from "@/components/radio";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Popup from "@/components/popup";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const Pay: FC = () => {
  const route:any = useRouter();

  const payModesDefault = [
      { name: "微信支付", value: 1, label: "WX_PAY", logo: require("@/assets/icons/payicon/wechat.png") },
      { name: "支付宝支付", value: 2, label: "ALIPAY", logo: require("@/assets/icons/payicon/alipay.png") },
      { name: "银联网银支付", value: 3, label: "ELECTRONIC", logo: require("@/assets/icons/payicon/unionpay.png") },
      { name: "QQ支付", value: 4, label: "QQ_PAY", logo: require("@/assets/icons/payicon/qqpay.png") },
      { name: "银行卡", value: 5, label: "BANK_PAY", logo: require("@/assets/icons/payicon/bank.png") },
      // { name: "微信支付-自有", value: 6, label: "WX_PAY_SELF" },
      { name: "储值资金", value: 10, label: "VALUE_PAY", logo: require("@/assets/icons/payicon/ctpay.png") },
      { name: "线下标记", value: 11, label: "MARK_PAY", logo: require("@/assets/icons/payicon/offline.png") },
      { name: "现金", value: 13, label: "CASH_PAY", logo: require("@/assets/icons/payicon/cashpay.png") },
      { name: "余额支付", value: 12, label: "SHOP_BALANCE", logo: require("@/assets/icons/payicon/yuepay.png") }
      // { name: "花呗分期", value: 7, label: "CASH_PAY" }
    ];
  const payTypes = [
    { name:"扫码收款", value:"SCAN" },
    { name:"二维码收款", value:"QR" }
  ];
  const pay_types = {
    1: "WX_",
    2: "ALIPAY_"
  };
  const defaultPayData = {
    discount: null ,
    order_id: null,
    order_type: 1,
    pay_auth_code: null,
    pay_channel:1,
    pay_type: "",
    self_have: "",
    pay_type_name: "" ,
    uid: null ,
    pay_pass: null
  };
  useEffect(()=>{
    if(route.params?.order_id && route.params?.order_type){
      mergeOrder();
      setPayData(val=>{
        let item = JSON.parse(JSON.stringify(val));
        item.order_id = parseInt(route.params?.order_id);
        item.order_type = parseInt(route.params?.order_type);
        return item;
      });
    }

    eventCenterOn("orderState",res=>{
      const msg = res[0];
      console.log(route,"orderState");
      if(msg.event && msg.event === "state"){
        if(msg.state > 2){
          navigateTo({ method:"navigateBack",delta:parseInt(route.params?.delta) });
          // 通知回去刷新
          if(route.params?.eventLabel){
            eventCenterTrigger(route.params?.eventLabel);
          }
        }
      }
    });
    return ()=>{
      closeScene("orderState");
      eventCenterOff("orderState");
    };
  },[]);

  const [err,setErr] = useState("");
  const [payData,setPayData] = useState<any>(defaultPayData);
  const [orderDetail,setOrderDetail] = useState<any>({});
  const [payModes,setPayModes] = useState<any[]>([]);
  const [payChannels,setPayChannels] = useState<any>({ value:0 ,name:"" });
  const [showQRCodeImg,setShowQRCodeImg] = useState(false);// 是否显示二维码
  const [qRCodeImg,setQRCodeImg] = useState("");// 二维码支付 二维码数据
  const [searchValue,setSearchValue] = useState("");// 储备金支付 用户
  const [userList,setUserList] = useState([]);// 搜索用户列表
  const [showUserPwd,setShowUserPwd] = useState(false);// 搜索用户列表

  useEffect(()=>{

  },[payChannels]);

  const mergeOrder = ()=>{
    setErr("");
    let obj = {
      order_id: parseInt(route.params?.order_id),
      order_type: parseInt(route.params?.order_type)
    };
    orderApi.userOrder.getOrderPay(obj).then(res=>{
      console.log(res,"mergeOrder");
      if(!!res && res.code === 0){
        connectScene("orderState",{ order_id: parseInt(route.params?.order_id), order_type:parseInt(route.params?.order_type) });
        setOrderDetail(res?.data?.order || {});
        let modes = res.data.pay_mode;
        let list:any = [];
        payModesDefault.forEach(item => {
          if (modes[item.value]) {
            let mode = modes[item.value];
            if (item.value > 6) {
              list.push({ ...item, pay_type: mode.pay_type, is_have: false });
            } else {
              // 有自有支付
              list.push({ ...item, pay_type: mode.pay_type, is_have: !!mode.is_have });
            }
          }
        });
        setPayModes(list);
      }else{
        setErr(res?.message || "加载错误");
      }
    }).catch((res)=>{
      setErr(res?.message || "加载错误");
    });
  };

  const SCAN = (payData)=>{
    Taro.scanCode({
      onlyFromCamera: true,
      scanType: ["qrCode"],
      success: (res) => {
        if(res.result){
          let obj = {
            self_have: payData.self_have,
            order_id: payData.order_id,
            order_type: payData.order_type,
            pay_channel: payData.pay_channel,
            pay_type:payData.pay_type,
            pay_auth_code: res.result,
            discount:getDiscount(payData.discount)
          };
          orderCashier(obj);
        }
      },
      fail: (res) => {
        Taro.showToast({ title: res.errMsg, icon:"none" });
      }
    });
  };

  const QR = (payData)=>{
    let obj = {
      self_have: payData.self_have,
      order_id: payData.order_id,
      order_type: payData.order_type,
      pay_channel: payData.pay_channel,
      pay_type: payData.pay_type,
      discount: getDiscount(payData.discount)
    };
    orderApi.userOrder.cashier(obj).then(res=>{
      if (res.code === 0 && res.data.pay_data){
        if(payData.pay_channel === 1){
          setQRCodeImg(res.data.pay_data);
        }
        if(payData.pay_channel === 2){
          setQRCodeImg(res.data.pay_data.qr_code);
        }
        setShowQRCodeImg(true);
      }else {
        Taro.showToast({ title:res.message, icon:"none" });
      }
    });
  };

  const getDiscount = (discount)=>{
    if(discount){
      if(Number(discount) > 0 && (orderDetail.pay_amount / 100) > Number(discount)){
        return parseFloat(Number(discount).toFixed(2)) * 100 ;
      }
    }
    return 0;
  };

  const PAY_OTHER = ()=>{
    let obj = {
      self_have: payData.self_have,
      order_id: payData.order_id,
      order_type: payData.order_type,
      openid:payData.uid ? payData.uid.toString() : null,
      pay_pass:payData.pay_pass ? payData.pay_pass : null,
      pay_channel: payData.pay_channel,
      pay_type:"PAY_OTHER",
      discount: getDiscount(payData.discount)
    };
    orderCashier(obj);
  };

  const orderCashier = (data)=>{
    console.log(data,"data");
    orderApi.userOrder.cashier(data).then(res=>{
      console.log(res,"res");
      if(res.code === 0){
        Taro.showToast({ title:"支付成功",icon:"success" });
        // 通知
      } else {
        if(res.code === 100 && data.pay_channel === 10){
          setShowUserPwd(true);
        }else {
          Taro.showToast({ title:res.message, icon:"error" });
        }
      }
    });
  };
  const searchUser = (searchValue: string)=>{
    if(searchValue){
      customerApi.customer.query({ keyword: searchValue, reserve: true }).then(res=>{
        if(res.code === 0){
          if (res.data?.info && res.data.info?.length > 0) {
            setUserList(res.data.info);
          } else {
            Taro.showToast({ title:"未找到相关用户", icon:"none" });
            setUserList([]);
          }
        } else {
          Taro.showToast({ title:res.message || "未找到相关用户", icon:"none" });
        }
      });
    }
  };

  const [bem] = createNamespace("payment");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {!err ? (
        <React.Fragment>
          <KeyboardAwareScrollView extraScrollHeight={40}>
          <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Field
                title="订单金额"
                input={false}
                inputAlign="right"
                inputStyle={{ fontSize: addUnit(16) }}
                value={`¥` + formatPrice(orderDetail.pay_amount)}
              />
              <Field
                title="优惠金额"
                type="number"
                titleRow
                intro={`当前最多可优惠¥${formatPrice(orderDetail.pay_amount)}`}
                introPosition="bottom"
                introStyle={{ marginTop: addUnit(12) }}
                icon={<View style={{ fontSize: addUnit(32) }}>¥</View>}
                inputStyle={!!payData.discount ? { fontSize: addUnit(32) } : { fontSize: addUnit(22) }}
                value={payData.discount}
                placeholder="输入对应优惠金额"
                onChange={(discount)=>{
                  if(discount > 0){
                    if(discount > orderDetail.pay_amount / 100){
                      Taro.showToast({ title: "优惠金额不能大于订单金额", icon: "none" });
                      return;
                    }
                  }
                  setPayData(val=>{
                    let item = JSON.parse(JSON.stringify(val));
                    item.discount = discount ? discount : 0;
                    return item;
                  });
                }}
              />
            </View>
            <View className="card-tips">如需优惠，需在支付提交前填写对应优惠金额，支付成功后即可享受优惠</View>
            <View className="card">
              <Cell
                title="需付金额"
                contentStyle={{ fontSize: addUnit(22), color: "#ff2340", fontWeight: "bold", lineHeight: addUnit(30) }}
                content={`¥${formatPrice(((orderDetail.pay_amount / 100) - payData.discount) * 100)}`}
              />
              <Cell
                title="支付方式"
                contentStyle={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end"
                }}
                content={
                  <React.Fragment>
                    {!!payChannels.logo ? (
                      <Image style={{ width: addUnit(16), height: addUnit(16), marginRight: addUnit(6) }} src={payChannels.logo} mode="aspectFill" />
                    ) : null}
                    <View style={!payChannels.name ? { color: "#ccc" } : {}}>
                      {!!payChannels.name ? payChannels.name : "请选择支付方式"}
                    </View>
                  </React.Fragment>
                }
                arrow
                onClick={()=>{
                  Taro.showActionSheet({
                    itemList: payModes.map(item=>item.name),
                    success: (res) =>{
                      console.log(res.tapIndex);
                      let row = payModes[res.tapIndex];
                      if(row){
                        setShowQRCodeImg(false);
                        setQRCodeImg("");
                        setSearchValue("");
                        setUserList([]);
                        setPayChannels(row);
                        setPayData(val=>{
                          let item = JSON.parse(JSON.stringify(val));
                          item.pay_type_name = "";
                          item.pay_type = "";
                          item.pay_channel = row.value;
                          item.self_have = row.self_have;
                          return item;
                        });
                      }
                    }
                  });
                }}
              />
              {payChannels.value === 10 ? (
                <Field
                  title="搜索用户"
                  type="search"
                  clearable
                  inputAlign="right"
                  value={searchValue}
                  placeholder="搜索用户手机/用户名"
                  onChange={(val)=>{
                    if(!val){
                      setUserList([]);
                    }
                    setSearchValue(val);
                  }}
                  onConfirm={(val)=>{
                    searchUser(val.detail.value);
                  }}
                />
              ) : null}

              {showUserPwd ? (
                <Field
                  title="支付密码"
                  type="password"
                  inputAlign="right"
                  value={payData.pay_pass}
                  placeholder="支付密码"
                  onChange={(pay_pass)=>{
                    setPayData((val)=>{
                      let item = JSON.parse(JSON.stringify(val));
                      item.pay_pass = pay_pass;
                      return { ...item };
                    });
                  }}
                />
              ) : null}
            </View>

            {userList.length > 0 ? (
              <View className="card">
                <View className="card-header card-header--border">
                  <View className="card-header__title">搜索结果</View>
                </View>
                {userList.map((item:any, index) => {
                  const _disabled = ((orderDetail.pay_amount / 100) - payData.discount) * 100 > (item.reserve ? item.reserve : 0);
                  return (
                    <Radio
                      cell
                      border={index !== 0}
                      key={item.uid}
                      checked={item.uid === payData.uid}
                      value={item.uid}
                      labelPosition="right"
                      label={`${item.name}-${item.phone}`}
                      desc={`余额：¥${formatPrice(item.reserve)}`}
                      descStyle={{ fontSize: addUnit(14), color: "#333" }}
                      disabled={_disabled}
                      right={
                        _disabled ? (
                          <Tag type="warning" size="small" plain={false}>余额不足</Tag>
                        ) : null
                      }
                      onChange={(uid)=>{
                        setPayData((val)=>{
                          let item = JSON.parse(JSON.stringify(val));
                          item.uid = uid;
                          return item;
                        });
                      }}
                    />
                  );
                })}
              </View>
            ) : null}

            {payChannels.value > 0 && payChannels.value < 6 ? (
              <View className={classnames(bem("type"))}>
                {payTypes.map(item=>{
                  return (
                    <View
                      key={item.value}
                      className={classnames(bem("type-item"))}
                      onClick={()=>{
                        setShowQRCodeImg(false);
                        setPayData(val=>{
                          let temp = JSON.parse(JSON.stringify(val));
                          temp.pay_type = pay_types[payChannels.value] + item.value;
                          temp.pay_type_name = item.name;
                          if(item.value == "SCAN"){
                            setTimeout(()=>{
                              SCAN(temp);
                            },200);
                          }
                          if(item.value == "QR"){
                            setTimeout(()=>{
                              QR(temp);
                            },200);
                          }
                          return temp;
                        });
                      }}
                    >
                      {item.value == "SCAN" ? (
                        <Image className={classnames(bem("type-icon"))} src={require("@/assets/icons/payicon/scan.png")} mode="aspectFill" />
                      ) : (
                        <Image className={classnames(bem("type-icon"))} src={payChannels.logo} mode="aspectFill" />
                      )}
                      <View className={classnames(bem("type-name",{ [`${payChannels.label}`]:!!payChannels?.label && item.value == "QR" }))}>{item.name}</View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </ScrollView>
          </KeyboardAwareScrollView>
          {(payChannels.value > 6 && payChannels.value !== 10) || (payChannels.value === 10 && payData.uid) ? (
            <BottomBar>
              <Button
                style={{ width: "70%" }}
                type="success"
                onClick={PAY_OTHER}
              >
                立即支付
              </Button>
            </BottomBar>
          ) : null}
        </React.Fragment>
      ) : (
        <Empty desc={`${err || "加载错误"}，请返回重试`} image="error" card />
      )}
      <Popup
        show={showQRCodeImg}
        title="请扫码付款"
        position="center"
        scroll={false}
        onClose={()=>{
          setShowQRCodeImg(false);
        }}
      >
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: addUnit(16)
          }}
        >
          <QRCodeImg
            codeValue={qRCodeImg}
            errorCorrectLevel="L"
            size={300}
          />
        </View>
      </Popup>
    </View>
  );
};

export default Pay;
