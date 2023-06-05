import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Image, ScrollView, View } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { customerApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { formatPrice } from "@/utils/common";
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import Radio from "@/components/radio";
import Popup from "@/components/popup";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "../detail/index.scss";

const LevelEdit: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _type = getCurrentInstance().router?.params?.type;
  const _growth = getCurrentInstance().router?.params?.growth;
  const _level = getCurrentInstance().router?.params?.level;
  const _name = _type && _type === "2" ? "收费" : "免费";
  const _title = _id ? `编辑${_name}等级` : `添加${_name}等级`;

  const colors = [
    "#646666",
    "#4b77bf",
    "#079be5",
    "#4da9d7",
    "#53af47",
    "#34a970",
    "#18918e",
    "#8f53cd",
    "#b936d5",
    "#cf2aae",
    "#dca06b",
    "#deab2f",
    "#e4a648",
    "#e48a1b",
    "#ff8d00",
    "#e96c50",
    "#ff3d3d",
    "#e74141"
  ];
  const init = {
    name: "", // 会员等级名称
    color_code: "#646666",
    cover_url: "",
    bgImage: false,
    free_growth: null, // 免费会员成长值
    level_value: 0, // 免费会员等级值
    state: 1, // 状态 1正常 2停用
    type: 1, // 会员类型 1免费会员 2付费会员
    vip_rule: [], // 付费会员规则
    benefit_bag: [] // 权益列表及设置
  };

  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);
  const [growth, setGrowth] = useState({ min: 0, max: -1 });

  useEffect(() => {
    setForm(prevState=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.type = parseInt(_type || "1");
      if(temp.type === 1 && _level){
        temp.level_value = parseInt(_level || "0") + 1;
      }
      return temp;
    });
    if(_growth){
      const split = _growth.split("to");
      setGrowth({
        min: parseInt(split[0] || "0"),
        max: parseInt(split[1] || "-1")
      });
    }
    if (!!_id) {
      Taro.setNavigationBarTitle({ title: _title });
      getLevelDetail(_id);
      getBenefitList();
    }
  }, []);

  useEffect(()=>{
    eventCenterOn("materialLevelEdit", (res) => {
      const msg = res[0];
      if(!!msg[0]){
        handleValueChange(true,"bgImage");
        handleValueChange(msg[0],"cover_url");
      }
    });
    eventCenterOn("levelSelect", (res) => {
      if(!!res[0]){
        if(!!res[0]?.type){
          // console.log(res[0]?.select[0],"res");
          if(res[0]?.type === "rights"){
            setRightsList(res[0]?.select);
          }
          if(res[0]?.type === "gifts"){
            setGiftList(res[0]?.select);
          }
        }
      }
    });
    return () => {
      eventCenterOff("levelSelect");
      eventCenterOff("materialLevelEdit");
    };
  },[]);

  const getLevelDetail = (id)=>{
    customerApi.level.get({ id: parseInt(id) })
      .then((res:any)=>{
        if (!res.error && res.code === 0) {
          const data = Object.assign({}, init, res?.data ?? {});
          data.benefit_bag = data?.benefit_bag || [];
          data.bgImage = !!data?.cover_url;
          setForm(data);
        }
      }).finally(()=>{
      setLoading(false);
    });
  };

  const [giftList, setGiftList] = useState<any[]>([]);
  const [rightsList, setRightsList] = useState<any[]>([]);
  const [benefitList, setBenefitList] = useState<any[]>([]);
  const getBenefitList = () => {
    if(benefitList.length === 0){
      customerApi.benefit.page({ page: 1, page_size: 999, simple: false, type: 1 })
        .then((res) => {
          // console.log(res,"getBenefitList");
          if (!!res && res.code === 0) {
            setBenefitList(res?.data?.list || []);
          }
        });
    }
  };
  const formatBenefitList = () => {
    const _rights = form.benefit_bag.filter(benefit => benefitList.some(rights => rights.benefit_id === benefit?.benefit_info?.benefit_id));
    const _gift = form.benefit_bag.filter(benefit => benefitList.every(gift => gift.benefit_id !== benefit?.benefit_info?.benefit_id));

    setRightsList(_rights.map(item=>item.benefit_info));
    setGiftList(_gift.map(item=>item.benefit_info));
  };
  const fixBenefitList = (list) => {
    if(!!list && list.length > 0){
      return list.map(item => {
        return {
          benefit_id: item.did,
          value: item.value
        };
      });
    }else{
      return [];
    }
  };

  useEffect(()=>{
    if(benefitList.length > 0){
      formatBenefitList();
    }
  },[benefitList, form.benefit_bag]);

  const handleValueChange = (val, type, father = "", index = -1) =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father){
        if(index !== -1){
          temp[father][index][type] = val;
        }else{
          temp[father][type] = val;
        }
      }else{
        temp[type] = val;
      }
      return temp;
    });
  };

  const ruleInit = {
    price: "",
    stock_num: "",
    term_days: 30,
    term_name: ""
  };
  const [rulePopup, setRulePopup] = useState({
    show: false,
    title: "",
    index: -1,
    daysList: [
      { label: "1个月", value: 30, disabled: false },
      { label: "3个月", value: 90, disabled: false },
      { label: "半年", value: 180, disabled: false },
      { label: "一年", value: 360, disabled: false }
    ],
    err: {
      price: "",
      stock_num: "",
      term_name: "",
      term_days: ""
    }
  });
  const [ruleForm, setRuleForm] = useState<any>(ruleInit);
  const handleEditRule = (index, item:any = null) => {
    setRulePopup(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.show = true;
      temp.title = index === -1 ? "添加规则" : "修改规则";
      temp.index = index;
      return temp;
    });
    setRuleForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(index !== -1 && !!item){
        temp = Object.assign({}, ruleInit, item);
        temp.price = (temp.price / 100).toFixed(2);
      }else{
        temp = Object.assign({}, ruleInit);
      }
      return temp;
    });
  };
  const handleSaveRule = () => {
    const _ruleForm = JSON.parse(JSON.stringify(ruleForm));
    let verify = false;
    setRulePopup(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.err.term_name = !_ruleForm.term_name ? "请输入规则名称" : "";
      temp.err.price = !_ruleForm.price ? "请输入规则价格" : "";
      temp.err.stock_num = !_ruleForm.stock_num ? "请输入规则库存" : "";
      const idx = form.vip_rule.map(item=>item.term_days).indexOf(_ruleForm.term_days);
      temp.err.term_days = idx > -1 && idx !== temp.index ? "已有此有效期规则，请选择其它有效期" : "";
      verify = !!_ruleForm.term_name && !!_ruleForm.stock_num && !!_ruleForm.price && !(idx > -1 && idx !== temp.index);
      return temp;
    });
    if (!verify) return;
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      ruleForm.price = parseInt(ruleForm.price) * 100;
      ruleForm.stock_num = parseInt(ruleForm.stock_num);
      if(rulePopup.index > -1){
        temp.vip_rule[rulePopup.index] = ruleForm;
      }else{
        temp.vip_rule.push(ruleForm);
      }
      return temp;
    });
    handleCloseRule();
  };
  const handleCloseRule = () => {
    setRulePopup(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.show = false;
      temp.title = "";
      temp.err = {
        price: "",
        stock_num: "",
        term_name: ""
      };
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(_form.bgImage && !_form.cover_url) {
      Taro.showToast({ title: "请选择背景图片", icon: "none" });
      return;
    }
    delete _form.bgImage;
    if (!_form.name) {
      Taro.showToast({ title: "请输入等级名称", icon: "none" });
      return;
    }
    if(_form.type === 1 ){
      delete _form.vip_rule;
      if(!_form.free_growth){
        Taro.showToast({ title: "请输入成长值", icon: "none" });
        return;
      }else{
        _form.free_growth = parseInt(_form.free_growth);
        if(_form.free_growth < growth.min || _form.free_growth > (growth.max !== -1 ? growth.max : 999999)){
          Taro.showToast({ title: `成长值必须为${growth.min}到${growth.max !== -1 ? growth.max : 999999}之间的整数`, icon: "none" });
          return;
        }
      }
    }else if(_form.type === 2 ){
      delete _form.free_growth;
      delete _form.level_value;
      if(!_form.vip_rule || _form.vip_rule.length === 0){
        Taro.showToast({ title: "请至少添加一条付费规则", icon: "none" });
        return;
      }
    }

    _form.benefit_bag = [];
    if(giftList.length > 0){
      _form.benefit_bag = _form.benefit_bag.concat(fixBenefitList(giftList));
    }
    if(rightsList.length > 0){
      _form.benefit_bag = _form.benefit_bag.concat(fixBenefitList(rightsList));
    }

    // console.log(_form,"_form");
    setLoading(true);
    const action = !!_form.id ? "edit" : "add";
    customerApi.level[action](_form).then((res) => {
      console.log(res,"res");
      if (!!res && res.code === 0) {
        eventCenterTrigger("levelEdit", form.type);
        navigateTo({ method: "navigateBack", delta: !!_form.id ? 2 : 1 });
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  const [bem] = createNamespace("card","member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card-title">基础设置</View>
        <View className="card">
          <View className={classnames(bem("card"), "card")} style={{ marginTop: addUnit(12) }}>
            <View className={classnames(bem("backdrop"))} style={{ backgroundColor: form.color_code || "#646666" }}>
              <Image className={classnames(bem("backdrop-watermark"))} src={require("@/assets/card/level-benefit.png")} mode="aspectFill" />
              {form.bgImage && (!!form.cover_url) ? (
                <Image
                  className={classnames(bem("backdrop-image"))}
                  src={base.file_host + "/" + form.cover_url}
                  mode="aspectFill"
                />
              ) : null}
            </View>
          </View>
          <ScrollView scrollWithAnimation scrollX>
            <View className={classnames(bem("color"))}>
              {colors.map((color,index)=>{
                return (
                  <View
                    key={`color-${index}`}
                    className={classnames(bem("color-item"))}
                    style={{ backgroundColor: color }}
                    onClick={()=>{
                      handleValueChange(color,"color_code");
                    }}
                  >
                    {form.color_code === color ? (
                      <View className={classnames(bem("color-check"))} />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <Cell
            title="使用背景图片"
            extra={
              <Switch
                checked={form.bgImage}
                onChange={(val)=>{ handleValueChange(val,"bgImage");}}
              />
            }
          />
          {form.bgImage ? (
            <Field
              title="背景图片"
              input={false}
              arrow
              clickable
              onClick={() => {
                navigateTo({ method: "navigateTo", url: "/pages/shop/material/index", params: { refs: "materialLevelEdit" } });
              }}
            />
          ) : null}
        </View>
        <View className="card">
          <Field
            required
            title="等级名称"
            value={form.name}
            placeholder="身份称谓"
            onChange={(val)=>{ handleValueChange(val,"name");}}
          />
          {form.type === 1 ? (
            <React.Fragment>
              <Field
                required
                title="获得条件"
                type="digit"
                value={form.free_growth}
                placeholder={`${growth.min}到${growth.max !== -1 ? growth.max : 999999}之间的整数`}
                right="成长值"
                onChange={(val)=>{ handleValueChange(val,"free_growth");}}
              />
            </React.Fragment>
          ) : null}
        </View>
        {form.type === 1 ? (
          <View className="card-tips">
            修改等级所需成长值后，部分客户会因无法达到该成长值要求而发生会员等级的变化
          </View>
        ) : null}
        {form.type === 2 ? (
          <React.Fragment>
            <Cell
              border={false}
              title="付费规则"
              textStyle={{ fontWeight: "bold" }}
              content={
                <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
                  <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                  <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
                </View>
              }
              extra="添加规则"
              extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
              style={{ marginLeft: addUnit(12), marginRight: addUnit(12) }}
              onClick={() => {
                handleEditRule(-1);
              }}
            />
            <View className="card">
              {form.vip_rule && form.vip_rule.length > 0 ? (
                <React.Fragment>
                  {form.vip_rule.map((rule:any, idx)=>{
                    return (
                      <Cell
                        key={`rule-${idx}`}
                        title={rule.term_name}
                        content={`${rule.term_days}天 · `}
                        extraStyle={{ marginLeft: 0, fontSize: addUnit(14), color: "#ff2340" }}
                        extra={`¥${formatPrice(rule.price)}`}
                        arrow
                        onClick={()=>{
                          handleEditRule(idx, rule);
                        }}
                      />
                    );
                  })}
                </React.Fragment>
              ) : (
                <Cell
                  title="请至少添加一条付费规则"
                  textStyle={{ color: "#999" }}
                  arrow
                  onClick={() => {
                    handleEditRule(-1);
                  }}
                />
              )}
            </View>
          </React.Fragment>
        ) : null}
        <View className="card-title">权益礼包</View>
        <View className="card">
          <Cell
            title="设置权益"
            extra={rightsList.length > 0 ? "已设置" : ""}
            arrow
            clickable
            onClick={() => {
              navigateTo({ url: "/pages/com/benefit-select/index", method: "navigateTo", params: { select: rightsList, type: 1, mode: "rights", refs: "levelSelect" } });
            }}
          />
          <Cell
            title="设置礼包"
            extra={giftList.length > 0 ? "已设置" : ""}
            arrow
            clickable
            onClick={() => {
              navigateTo({ url: "/pages/com/benefit-select/index", method: "navigateTo", params: { select: giftList, type: 2, mode: "gifts", refs: "levelSelect" } });
            }}
          />
        </View>
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          loading={loading}
          type="info"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        show={rulePopup.show}
        title={rulePopup.title}
        position="full"
        bgColor="#f7f8f8"
        onClose={handleCloseRule}
      >
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            title="有效期"
            titleRow
            input={false}
            errorIcon={false}
            error={!!rulePopup.err.term_days}
            errorMessage={rulePopup.err.term_days}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginLeft: addUnit(-6),
                marginRight: addUnit(-6)
              }}
            >
              {rulePopup.daysList.map((days, idx)=>{
                return (
                  <Radio
                    key={`days-${days.value}-${idx}`}
                    style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                    plain
                    size="large"
                    type="button"
                    label={days.label}
                    checked={ruleForm.term_days === days.value}
                    disabled={days.disabled}
                    value={days.value}
                    onChange={()=>{
                      setRuleForm(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp.term_days = days.value;
                        return temp;
                      });
                      setRulePopup(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        const idx = form.vip_rule.map(item=>item.term_days).indexOf(days.value);
                        temp.err.term_days = idx > -1 && idx !== temp.index ? "已有此有效期规则，请选择其它有效期" : "";
                        return temp;
                      });
                    }}
                  />
                );
              })}
            </View>
          </Field>
          <Field
            required
            title="名称"
            value={ruleForm.term_name}
            placeholder="输入规则名称"
            errorIcon={false}
            error={!!rulePopup.err.term_name}
            errorMessage={rulePopup.err.term_name}
            onChange={(val)=>{
              setRuleForm(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.term_name = val;
                setRulePopup(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.err.term_name = !val ? "请输入规则名称" : "";
                  return temp;
                });
                return temp;
              });
            }}
          />
          <Field
            required
            title="价格"
            type="number"
            value={ruleForm.price}
            placeholder="输入价格"
            errorIcon={false}
            error={!!rulePopup.err.price}
            errorMessage={rulePopup.err.price}
            onChange={(val)=>{
              setRuleForm(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.price = val;
                setRulePopup(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.err.price = !val ? "请输入规则价格" : "";
                  return temp;
                });
                return temp;
              });
            }}
            right="元"
          />
          <Field
            required
            title="库存"
            type="digit"
            value={ruleForm.stock_num}
            placeholder="输入库存"
            errorIcon={false}
            error={!!rulePopup.err.stock_num}
            errorMessage={rulePopup.err.stock_num}
            onChange={(val)=>{
              setRuleForm(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.stock_num = val;
                setRulePopup(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.err.stock_num = !val ? "请输入规则库存" : "";
                  return temp;
                });
                return temp;
              });
            }}
          />
        </View>
        <View className="bottom-bar">
          <Button
            style={{ width: "70%" }}
            type="info"
            onClick={handleSaveRule}
          >
            确定
          </Button>
          {rulePopup.index !== -1 && form.vip_rule.length > 1 ? (
            <Button
              style={{ width: "70%", marginTop: addUnit(20) }}
              type="primary"
              hairline
              onClick={()=>{
                setForm(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  if(!!temp.vip_rule && temp.vip_rule.length > 0){
                    temp.vip_rule.splice(rulePopup.index,1);
                  }
                  handleCloseRule();
                  return temp;
                });
              }}
            >
              删除此规则
            </Button>
          ) : null}
        </View>
      </Popup>
    </View>
  );
};

export default LevelEdit;
