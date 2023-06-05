import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Switch from "@/components/switch";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const JifenRule: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const _title = Object.keys(_params).length > 0 ? `编辑积分规则` : `新建积分规则`;

  const init = {
    rule_type: 2,
    points_limit: null,
    points: null,
    send_message: 1,
    use_goods: [-1]
  };

  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(init);
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || {}));
      if (_form.rule_type === 3) {
        _form.points_limit = formatPrice(_form.points_limit);
      }
      setForm(_form);
    }
  }, []);

  const handleValueChange = (val, type, father = "", index = -1) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if (!!father) {
        if (index !== -1) {
          temp[father][index][type] = val;
        } else {
          temp[father][type] = val;
        }
      } else {
        temp[type] = val;
      }
      return temp;
    });
  };

  const refs = "pointSelectGoods";
  useEffect(() => {
    eventCenterOn(refs, (res) => {
      if(!!res && !!res[0]){
        handleValueChange(res[0], "use_goods");
      }
    });
    return () => {
      eventCenterOff(refs);
    };
  }, []);

  // 保存
  const onSubmit = () => {
    let verify = true;

    if(form.rule_type === 2){
      if (!form.points_limit) {
        Taro.showToast({ title: "每成功交易笔数不能为空", icon: "none" });
        return false;
      }else{
        form.points_limit = parseInt(form.points_limit);
      }
    }else if(form.rule_type === 3){
      if (!form.points_limit) {
        Taro.showToast({ title: "每购买金额不能为空", icon: "none" });
        return false;
      }else{
        form.points_limit = Number(form.points_limit) * 100;
      }
    }
    if (!form.points) {
      Taro.showToast({ title: "奖励积分值不能为空", icon: "none" });
      return false;
    }else{
      form.points = parseInt(form.points);
    }
    if (form.rule_type === 3 && form.use_goods.length === 0) {
      Taro.showToast({ title: "请选择商品", icon: "none" });
      return false;
    }

    if(!verify) return;
    setLoading(true);
    pluginApi.plugin("PUT", 262, "ruleEdit", JSON.stringify(form)).then(res => {
      console.log(res,"res");
      if (res.code === 0 && res.data) {
        eventCenterTrigger("pointEdit", { type: 1 });
        navigateTo({ method:"navigateBack" });
      }else{
        Taro.showToast({ title: res.message, icon: "none" });
      }
    }).catch((res)=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setLoading(false);
    });
  };

  const deleteClick = ()=>{
    Taro.showModal({
      title: "删除提示",
      content: "确定要删除此积分规则？",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi.plugin("PUT", 262, "ruleDelete", JSON.stringify({ id: form.id })).then(res => {
            console.log(res,"res");
            if (res.code === 0) {
              eventCenterTrigger("pointEdit", { type: 1 });
              navigateTo({ method:"navigateBack" });
            }else{
              Taro.showToast({ title: res.message, icon: "none" });
            }
          }).catch((res)=>{
            Taro.showToast({ title: res.message, icon: "none" });
          }).finally(()=>{
            setLoading(false);
          });
        }
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            title="规则类型"
            titleWidth={90}
            input={false}
            value={["关注我的微信", "成功交易", "购买金额"][form.rule_type - 1]}
            arrow
            clickable
            onClick={() => {
              Taro.showActionSheet({
                itemList: ["关注我的微信", "成功交易", "购买金额"],
                success: function (res) {
                  handleValueChange(res.tapIndex + 1, "rule_type");
                  handleValueChange(null, "points_limit");
                }
              });
            }}
          />
          {form.rule_type === 2 ? (
            <Field
              required
              title="每成功交易"
              titleWidth={90}
              type="digit"
              value={form.points_limit}
              placeholder="请输入整数"
              onChange={(val) => { handleValueChange(val, "points_limit"); }}
              right="笔"
            />
          ) : null}
          {form.rule_type === 3 ? (
            <Field
              required
              title="每购买金额"
              titleWidth={90}
              type="number"
              value={form.points_limit}
              placeholder="请输入金额"
              onChange={(val) => { handleValueChange(val, "points_limit"); }}
              right="元"
            />
          ) : null}
        </View>
        <View className="card">
          <Field
            border={false}
            required
            title="奖励积分值"
            titleWidth={90}
            type="digit"
            value={form.points}
            placeholder="请输入整数"
            onChange={(val) => { handleValueChange(val, "points"); }}
            right="分"
          />
        </View>
        <View className="card">
          <Cell
            border={false}
            title="通知"
            extra={
              <Switch
                checked={form.send_message === 2}
                activeValue={2}
                inactiveValue={1}
                onChange={(val) => {
                  handleValueChange(val, "send_message");
                }}
              />
            }
          />
        </View>
        {form.rule_type === 3 ? (
          <View className="card">
            <Field
              border={false}
              title="适用商品"
              titleWidth={90}
              input={false}
              value={form.use_goods[0] === -1 ? "全部商品" : "指定商品"}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["全部商品", "指定商品"],
                  success: function (res) {
                    if (res.tapIndex === 0) {
                      handleValueChange([-1], "use_goods");
                    } else {
                      handleValueChange([], "use_goods");
                    }
                  }
                });
              }}
            />
            {form.use_goods[0] !== -1 ? (
              <React.Fragment>
                <Field
                  required
                  title="选择商品"
                  titleWidth={90}
                  input={false}
                  value={form.use_goods.length > 0 ? `已选${form.use_goods.length}件商品` : ""}
                  placeholder="请选择商品"
                  arrow
                  clickable
                  onClick={()=>{
                    navigateTo({
                      method:"navigateTo",
                      url: "/pages/com/goods-select/index",
                      params: {
                        refs: refs,
                        ids: form.use_goods,
                        multiple: true
                      }
                    });
                  }}
                />
              </React.Fragment>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <BottomBar>
        {!!form.id ? (
          <Button
            loading={loading}
            style={{ marginRight: addUnit(12) }}
            hairline
            type="primary"
            onClick={deleteClick}
          >
            删除
          </Button>
        ) : null}
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={onSubmit}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default JifenRule;
