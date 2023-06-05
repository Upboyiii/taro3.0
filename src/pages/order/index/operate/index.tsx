import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { config, findState, findLabel } from "@/pages/order/utils/config";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import CitySelect from "@/components/city-select";
import Cell from "@/components/cell";
import Radio from "@/components/radio";
import Checkbox from "@/components/checkbox";
import Field from "@/components/field";
import Tag from "@/components/tag";
import Popup from "@/components/popup";
import Button from "@/components/button";
import Tabs from "@/components/tabs";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const OrderExpress: FC = () => {

  const _params = getCurrentInstance().router?.params || {};

  const init = {
    state: 0,
    order_id: 0, // 订单ID
    type: null, // 操作类型 1关闭交易 2修改邮寄地址 3修改价格 4添加标记 5发货 6超卖发货 7再次补贴 8取消子订单 9打印小票 10修改运费
    mark: "", // 4添加标记添加(取消订单为取消原因)
    close: {
      ids: [], // 需要关闭的订单子ID
      type: 1 // 售后类型 1未收货退款(子订单全退退运费退积分退优惠券等) 2退货退款(不退运费，子订单全退退运费退积分退优惠券等)
    },
    mailing: {
      address: "", // 详细地址
      county_id: 0, // 所在县ID
      name: "", // 收货人姓名
      phone: "" // 联系电话
    },
    price: { // 3修改价格
      discount: "",
      msg: "",
      sub_ids: [
        {
          discount: null, // 商品优惠金额
          id: 0 // 订单列表 标识 Id
        }
      ]
    },
    freight: "", // 修改运费
    deliver: {
      express: {
        exp_nu: "", // 快递单号
        type: 2, // 发货类型 1标记发货 2物流信息
        exp_type: null // 公司名称 1圆通 2申通 3中通 4顺丰 5百世 6德邦 7邮政 8韵达 9极兔 10京东
      },
      ids: []
    }
  };
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [goodsShow, setGoodsShow] = useState<any>({
    visable: false,
    ids: []
  });
  const [form, setForm] = useState<any>(init);
  const handleValueChange = (val, ref, father = "", grandpa = "") => {
    setForm((prevState)=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father){
        if(!!grandpa){
          temp[grandpa][father][ref] = val;
        }else{
          temp[father][ref] = val;
        }
      }else{
        temp[ref] = val;
      }
      return temp;
    });
  };

  useEffect(()=>{
    if(Object.keys(_params).length > 0){
      Taro.setNavigationBarTitle({ title: _params.title || "订单操作" });
      setForm(()=>{
        let temp:any = {};
        temp.state = parseInt(_params.state || "0");
        temp.order_id = parseInt(_params.order_id || "0");
        temp.type = parseInt(_params.type || "0");
        if(temp.type === 1){
          temp.close = Object.assign({}, init.close);
        }
        if(temp.type === 2 && _params.mailing){
          temp.mailing = Object.assign({}, init.mailing, _params.mailing);
        }
        if(temp.type === 3){
          temp.price = Object.assign({}, init.price);
          temp.pay_amount = Number(_params.pay_amount || "0");
          temp.discount = Number(_params.discount || "0");
        }
        if(temp.type === 5){
          temp.express_fail = _params?.express_fail;
          temp.deliver = Object.assign({}, init.deliver);
        }
        if(temp.type === 10 && _params.freight){
          temp.freight = _params.freight;
        }
        // console.log(temp,"temp");
        return temp;
      });
      if(_params?.goods_list){
        setGoodsList(JSON.parse(_params?.goods_list));
      }
      // console.log(_params,"_params");
    }
  },[]);

  const [goodsLabel, setGoodsLabel] = useState<any[]>([]);
  useEffect(()=>{
    if(goodsList.length > 0){
      let labels:any = [];
      goodsList.forEach(item=>{
        if(goodsShow.ids.indexOf(item.id) > -1){
          labels.push(item.name);
        }
      });
      setGoodsLabel(labels);
    }
  },[goodsShow.ids, goodsList]);

  // 修改地址
  const [cityShow, setCityShow] = useState(false);
  const [countyLabel, setCountyLabel] = useState("");
  const citySelectConfirm = (data) => {
    let city: string = "", county_id = 0;
    if (Array.isArray(data) && data.length > 0) {
      county_id = Number(data.slice(-1)[0].id);
      data.map((item, index) => {
        if (index !== 0) city += "/";
        city += item.label;
      });
    }
    setCountyLabel(city);
    handleValueChange(county_id,"county_id","mailing");
  };

  // 修改价格
  const [tabsActive, setTabsActive] = useState(2);
  const saveClick = () => {
    let verify = false;
    let obj:any = {
      type: form.type,
      order_id: form.order_id
    };
    switch (obj.type) {
      case 1: // 取消订单
        if (goodsShow.ids.length === 0) {
          Taro.showToast({ title: "请选择商品", icon: "none" });
          return false;
        }
        obj.close = form.close;
        obj.close.ids = goodsShow.ids;

        if (!form.mark) {
          Taro.showToast({ title: "请填写取消原因", icon: "none" });
          return false;
        }
        obj.mark = form.mark;
        verify = true;
        break;

      case 2: // 标记
        if (!form.mailing.name) {
          Taro.showToast({ title: "请填写收货人姓名", icon: "none" });
          return false;
        }
        const phoneReg = /^1[3456789]\d{9}$/;
        if (!phoneReg.test(form.mailing.phone)) {
          Taro.showToast({ title: "请输入正确的手机号码", icon: "none" });
          return false;
        }
        if (!form.mailing.county_id) {
          Taro.showToast({ title: "请选择所在地区", icon: "none" });
          return false;
        }
        if (!form.mailing.address) {
          Taro.showToast({ title: "请填写详细地址", icon: "none" });
          return false;
        }
        obj.mailing = {
          name: form.mailing.name,
          phone: form.mailing.phone,
          county_id: form.mailing.county_id,
          address: form.mailing.address
        };

        verify = true;
        break;
      case 3: // 修改价格
        let price:any = {
          msg: form.price.msg,
          order_ids: [form.order_id]
        };
        if (tabsActive === 1) {
          if (!form.price.discount) {
            Taro.showToast({ title: "请填写优惠金额", icon: "none" });
            return false;
          }
          price.discount = Number(form.price.discount) * 100;
        }else{
          let formPrice = goodsList;
          let sub_ids = {};
          formPrice.forEach(item => {
            if (item.discount > 0) {
              sub_ids[item.id] = Number(item.discount) * 100;
            }
          });
          price.sub_ids = sub_ids;
          if (Object.keys(price.sub_ids).length <= 0) {
            Taro.showToast({ title: "请填写优惠金额", icon: "none" });
            return false;
          }
        }
        obj.price = price;
        verify = true;
        break;
      case 4: // 标记
        if (!form.mark) {
          Taro.showToast({ title: "请填写标记内容", icon: "none" });
          return false;
        }
        obj.mark = form.mark;
        verify = true;
        break;
      case 5: // 发货
        if (!!form.express_fail) {
          obj.deliver = {
            express: { type: 3 }
          };
        }else{
          if (goodsShow.ids.length === 0) {
            Taro.showToast({ title: "请选择商品", icon: "none" });
            return false;
          }
          if(form.deliver.express.type === 2 && !form.deliver.express.exp_type){
            Taro.showToast({ title: "请选择快递", icon: "none" });
            return false;
          }
          if (!form.deliver.express.exp_nu) {
            Taro.showToast({ title: form.deliver.express.type === 1 ? "请填写发货信息" : "快递单号", icon: "none" });
            return false;
          }
          obj.deliver = {
            ids: goodsShow.ids,
            express: {
              type: form.deliver.express.type,
              exp_nu: form.deliver.express.exp_nu
            }
          };
          if(form.deliver.express.type === 2){
            obj.deliver.express.exp_type = form.deliver.express.exp_type;
          }
        }
        verify = true;
        break;
      case 10: // 运费
        if (!form.freight) {
          Taro.showToast({ title: "请填写要修改的运费", icon: "none" });
          return false;
        }
        obj.freight = Number(form.freight) * 100;
        verify = true;
        break;
    }

    // console.log(form,"form");
    // console.log(obj,"obj");

    if(verify){
      orderApi.userOrder
        .operate(obj)
        .then(res => {
          if (!(!!res && res.code === 0)) {
            Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
          }
        })
        .catch(res => {
          Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
        })
        .finally(()=>{
          setTimeout(()=>{
            eventCenterTrigger("operateOrder");
            eventCenterTrigger("userOrder");
            navigateTo({ method:"navigateBack" });
          },500);
        });
    }
  };

  const renderGoods = () => {
    if(goodsList.length === 0) return;
    return (
      <Cell
        title="选择商品"
        contentStyle={goodsLabel.length === 0 ? { color: "#ccc" } : {}}
        content={goodsLabel.length === 0 ? "请选择商品" : `已选（${goodsLabel.length}）件商品`}
        arrow
        onClick={()=>{
          setGoodsShow(prevState=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.visable = true;
            return temp;
          });
        }}
      />
    );
  };
  const renderMark = (title) => {
    return (
      <Field
        border={false}
        required
        title={title}
        value={form.mark}
        inputAlign="right"
        placeholder={`请输入${title}`}
        onChange={(val)=>{
          handleValueChange(val,"mark");
        }}
      />
    );
  };
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {form.type === 3 ? (
        <Tabs
          // type="pill"
          active={tabsActive}
          options={[{ label: "总价优惠", value: 1 }, { label: "指定子订单优惠", value: 2 }]}
          onChange={setTabsActive}
        />
      ) : null}
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {form.type === 1 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              {renderGoods()}
              {form.state >= 3 ? (
                <Cell
                  title="退款类型"
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
                    label="未收货退款"
                    checked={form.close.type === 1}
                    value={1}
                    onChange={(val)=>{
                      handleValueChange(val,"type", "close");
                    }}
                  />
                  <Radio
                    style={{ marginLeft: addUnit(12) }}
                    plain
                    size="small"
                    type="button"
                    label="退货退款"
                    checked={form.close.type === 2}
                    value={2}
                    onChange={(val)=>{
                      handleValueChange(val,"type", "close");
                    }}
                  />
                </Cell>
              ) : null}
              <Cell
                title="退款类型"
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
                  label="未收货退款"
                  checked={form.close.type === 1}
                  value={1}
                  onChange={(val)=>{
                    handleValueChange(val,"type", "close");
                  }}
                />
                <Radio
                  style={{ marginLeft: addUnit(12) }}
                  plain
                  size="small"
                  type="button"
                  label="退货退款"
                  checked={form.close.type === 2}
                  value={2}
                  onChange={(val)=>{
                    handleValueChange(val,"type", "close");
                  }}
                />
              </Cell>
            </View>
          </React.Fragment>
        ) : null}
        {form.type === 1 || form.type === 4 ? (
          <View className="card" style={form.type === 4 ? { marginTop: addUnit(12) } : {}}>
            {renderMark(form.type === 1 ? "取消原因" : form.type === 4 ? "标记内容" : "备注")}
          </View>
        ) : null}
        {form.type === 2 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Field
                required
                clearable
                border={false}
                title="姓名"
                value={form.mailing.name}
                placeholder="请填写收货人姓名"
                onChange={(val)=>{
                  handleValueChange(val,"name", "mailing");
                }}
              />
              <Field
                required
                clearable
                type="tel"
                title="联系电话"
                value={form.mailing.phone}
                placeholder="请填写联系电话"
                onChange={(val)=>{
                  handleValueChange(val,"phone", "mailing");
                }}
              />
            </View>
            <View className="card">
              <Field
                required
                border={false}
                title="所在地区"
                input={false}
                arrow
                clickable
                placeholder="请选择省/市/区"
                value={form.mailing.county_id === 0 ? "" : countyLabel}
                onClick={() => {
                  setCityShow(true);
                }}
              />
              <Field
                required
                clearable
                type="textarea"
                title="详细地址"
                placeholder="请填写详细地址，如街道名称，门牌号等信息"
                value={form.mailing.address}
                onChange={(val) => {
                  handleValueChange(val, "address","mailing");
                }}
              />
            </View>
          </React.Fragment>
        ) : null}
        {form.type === 3 ? (
          <React.Fragment>
            <View
              className="card"
              style={{
                marginTop: addUnit(12),
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: addUnit(10)
              }}
            >
              应付总额：{formatPrice(form.pay_amount)}元，已优惠：{formatPrice(form.discount)}元
            </View>
            {tabsActive === 1 ? (
              <View className="card">
                <Field
                  required
                  clearable
                  type="number"
                  border={false}
                  title="优惠金额"
                  value={form.price.discount}
                  placeholder="请填写收优惠金额"
                  onChange={(val)=>{
                    handleValueChange(val,"discount", "price");
                  }}
                />
              </View>
            ) : (
              <React.Fragment>
                {goodsList.map((item, idx)=>{
                  return (
                    <View className="card" key={item.id}>
                      <Cell
                        border={false}
                        title={item.name}
                        label={item.sku_name}
                        labelStyle={{ marginTop: 0 }}
                        style={{ paddingTop: addUnit(10) }}
                      />
                      <Cell title="需付金额" content={`¥${formatPrice(item.pay_amount)}`} />
                      <Field
                        style={{ paddingTop: 0 }}
                        required
                        border={false}
                        clearable
                        type="number"
                        title="优惠金额"
                        inputAlign="right"
                        value={item.discount}
                        placeholder="请填写收优惠金额"
                        onChange={(val)=>{
                          setGoodsList((prevState)=>{
                            let temp = JSON.parse(JSON.stringify(prevState));
                            temp[idx].discount = val;
                            return temp;
                          });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            )}
            <View className="card">
              <Field
                clearable
                border={false}
                title="备注说明"
                value={form.price.msg}
                placeholder="填写备注说明"
                onChange={(val)=>{
                  handleValueChange(val,"msg", "price");
                }}
              />
            </View>
          </React.Fragment>
        ) : null}
        {form.type === 5 ? (
          <React.Fragment>
            {!!form.express_fail ? (
              <Empty image="order" title="发货失败" desc="当前系统发货失败，确认继续补发订单" />
            ) : (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {renderGoods()}
                <Cell
                  title="发货类型"
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
                    label="物流快递"
                    checked={form.deliver.express.type === 2}
                    value={2}
                    onChange={(val)=>{
                      handleValueChange(val,"type", "express","deliver");
                    }}
                  />
                  <Radio
                    style={{ marginLeft: addUnit(12) }}
                    plain
                    size="small"
                    type="button"
                    label="标记发货"
                    checked={form.deliver.express.type === 1}
                    value={1}
                    onChange={(val)=>{
                      handleValueChange(val,"type", "express","deliver");
                    }}
                  />
                </Cell>
                {form.deliver.express.type === 2 ? (
                  <React.Fragment>
                    <Picker
                      mode="selector"
                      range={config.expressList.map(item=>item.label)}
                      onChange={(e)=>{
                        const value = config.expressList[e.detail.value].value;
                        handleValueChange(value, "exp_type","express","deliver");
                      }}
                    >
                      <Cell
                        title="快递名称"
                        contentStyle={!form.deliver.express.exp_type ? { color: "#ccc" } : {}}
                        content={!!form.deliver.express.exp_type ? findLabel(form.deliver.express.exp_type, config.expressList) : "请选择快递"}
                        arrow
                      />
                    </Picker>
                    <Field
                      required
                      clearable
                      title="快递单号"
                      value={form.deliver.express.exp_nu}
                      inputAlign="right"
                      placeholder="请填写填写快递单号"
                      onChange={(val)=>{
                        handleValueChange(val,"exp_nu","express","deliver");
                      }}
                    />
                  </React.Fragment>
                ) : (
                  <Field
                    required
                    clearable
                    title="发货信息"
                    value={form.deliver.express.exp_nu}
                    inputAlign="right"
                    placeholder="请填写发货信息"
                    onChange={(val)=>{
                      handleValueChange(val,"exp_nu","express","deliver");
                    }}
                  />
                )}
              </View>
            )}
          </React.Fragment>
        ) : null}
        {form.type === 10 ? (
          <React.Fragment>
            <View
              className="card"
              style={{
                marginTop: addUnit(12),
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: addUnit(10)
              }}
            >
              当前运费价格：{formatPrice(form.freight)}元
            </View>
            <View className="card">
              <Field
                required
                clearable
                type="number"
                border={false}
                title="运费"
                value={form.freight}
                placeholder="请填写要修改的运费"
                onChange={(val)=>{
                  handleValueChange(val,"freight");
                }}
              />
            </View>
          </React.Fragment>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          type="default"
          plain
          style={{ flex: 1, marginRight: addUnit(12) }}
          onClick={()=>{
            // eventCenterTrigger("operateOrder");
            navigateTo({ method:"navigateBack" });
          }}
        >
          返回
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={saveClick}
        >
          {form.type === 5 && !!form.express_fail ? "补发订单" : "确定"}
        </Button>
      </BottomBar>
      <CitySelect
        show={cityShow}
        onCancel={() => {
          setCityShow(false);
        }}
        onConfirm={citySelectConfirm}
      />
      <Popup
        show={goodsShow.visable}
        position="pageSheet"
        bgColor="#f7f8f8"
        title="选择商品"
        onClose={()=>{
          setGoodsShow(prevState=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.visable = false;
            return temp;
          });
        }}
        action={
          <Button
            type="primary"
            style={{ width: "70%" }}
            onClick={()=>{
              setGoodsShow(prevState=>{
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.visable = false;
                return temp;
              });
            }}
          >
            确定
          </Button>
        }
      >
        <View className="card" style={{ marginTop: addUnit(12) }}>
          {goodsList.map((item,index)=>{
            return (
              <Checkbox
                key={`goods_${item.id || index}`}
                cell
                label={item.name}
                labelPosition="right"
                desc={form.type === 5 ? `运费：¥${formatPrice(item.freight || 0)}` : item?.sku_name}
                rightStyle={{ alignSelf: "flex-start" }}
                right={
                  <Tag size="small" plain={false}>{findState(form.state, item)}</Tag>
                }
                checked={goodsShow.ids.indexOf(item.id) > -1}
                onChange={(val)=>{
                  if(val){
                    if(goodsShow.ids.indexOf(item.id) === -1){
                      goodsShow.ids.push(item.id);
                    }
                  }else{
                    if(goodsShow.ids.indexOf(item.id) > -1){
                      goodsShow.ids.splice(goodsShow.ids.indexOf(item.id),1);
                    }
                  }
                }}
              />
            );
          })}
        </View>
      </Popup>
    </View>
  );
};

export default OrderExpress;
