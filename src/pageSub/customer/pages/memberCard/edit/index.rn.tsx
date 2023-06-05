import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Image, Picker, Text, ScrollView } from "@tarojs/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { formatLifeTime } from "../utils";
import { customerApi, profileApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { getTimeStamp, secToDate } from "@/utils/common";
import { getMainStore } from "@/utils/app";
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Switch from "@/components/switch";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "../detail/index.scss";

const MemberCardEdit: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _approval = getCurrentInstance().router?.params?.approval;

  const mainStore = getMainStore();// 店铺类型
  const colors = ["#23272d", "#516ab9", "#33a06b", "#c65048", "#ce9b52", "#d73c5c"];
  const init = {
    bgImage: false,
    isActivate: false,
    activation: {
      require_mobile: 0, // 验证手机号 1验证  不验证
      relation_profile: [], // 关联资料项目
      relation_profile_card: [{ id: 0, required: false }],
      profileCard_require: false //  档案卡是否必填
    },
    benefit_bag: [], // 权益列表及设置
    claim_meet: [ // 满足领取条件值数据 领取设置 2的条件
      { meet_type: 1, meet_value: "" },
      { meet_type: 2, meet_value: "" },
      { meet_type: 3, meet_value: "" }
    ],
    claim_type: 1, // 领取设置 1可直接领取 2满足条件领取 3需付费购买
    color_code: "#23272d", // 背景设置-背景色
    cover_url: "", // 背景设置-背景图
    description: "", // 使用须知
    goods_rule: {
      goods_no: "", // 商品编码
      price: "", // 价格
      stock_num: "" // 库存
    },
    life_time: {
      term_begin_at: "", // 指定生效时间
      term_days: 0, // 指定生效天数
      term_end_at: "", // 指定失效时间
      term_type: 1 // 卡有效期 1永久有效 2领卡后指定天生效 3指定日期
    },
    name: "", // 权益名称
    overdue: -1, // 过期后变更 -1 失效 其他指定权益
    reason: "", // 申请原因 (分店可添加权益卡且需要审批时使用)
    repeat_limit: {
      is_repeatable: 1, // 不限次数 1不限 2限制
      repeatable_limit: 0 // 有效期内限领次数
    },
    service_phone: "", // 客服电话
    state: 1, // 状态 1正常 2下架 3申请 4禁用
    store: [-1] // 适用店铺 -1 适用所有
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);
  const [approval, setApproval] = useState("2");

  useEffect(() => {
    eventCenterOn("materialCardEdit", (res) => {
      const msg = res[0];
      if(!!msg[0]){
        handleValueChange(true,"bgImage");
        handleValueChange(msg[0],"cover_url");
      }
    });
    eventCenterOn("memberCardSelect", (res) => {
      if(!!res[0]){
        if(!!res[0]?.type){
          if(res[0]?.type === "memberCard"){
            handleValueChange(res[0]?.ids,"overdue");
          }
          if(res[0]?.type === "store"){
            handleValueChange(res[0]?.ids,"store");
          }
          if(res[0]?.type === "rights"){
            setRightsList(res[0]?.select);
          }
          if(res[0]?.type === "gifts"){
            setGiftList(res[0]?.select);
          }
          if(res[0]?.type === "profileCard"){
            if(!!res[0]?.ids && res[0]?.ids.length > 0){
              setRelationProfileCardID(res[0]?.ids[0]);
            }else{
              setRelationProfileCardID(null);
            }
          }
          if(res[0]?.type === "profile"){
            handleValueChange(res[0]?.select,"relation_profile","activation");
          }
        }
      }
      // console.log(res[0],"res");
    });

    return () => {
      eventCenterOff("memberCardSelect");
      eventCenterOff("materialCardEdit");
    };
  }, []);

  useEffect(() => {
    if (!!_id) {
      Taro.setNavigationBarTitle({
        title: "编辑权益卡"
      });
      setApproval(_approval || "2");
      getCardDetail(Number(_id));
      getBenefitList();
    }
  }, []);

  useEffect(() => {
    if (!!form.overdue && form.overdue !== -1) {
      getCardDetail(form.overdue, true);
    }else{
      setMemberCardLabel("");
    }
  }, [form.overdue]);

  const [relationProfileCardID, setRelationProfileCardID] = useState(null);
  const [profileCardLabel, setProfileCardLabel] = useState("");
  useEffect(() => {
    if (!!relationProfileCardID) {
      const _id = relationProfileCardID;
      if(!!_id){
        getProfileCardLabel(_id);
      }
    }else{
      setProfileCardLabel("");
    }
  }, [relationProfileCardID]);
  const getProfileCardLabel = (id) => {
    profileApi.card.info({ id })
      .then((res) => {
        if(!!res && res.code === 0){
          setProfileCardLabel(res?.data?.name || "");
        }
      });
  };

  const [memberCardLabel, setMemberCardLabel] = useState("");
  const getCardDetail = (id, label = false) => {
    !label && setLoading(true);
    customerApi.benefitCard.get({ id })
      .then((res: any) => {
        if (!!res && res.code === 0) {
          let data:any = Object.assign({}, init, res?.data ?? {});
          data.activation = Object.assign({}, init.activation, res?.data?.activation ?? {});
          if(!label){
            data.bgImage = !!data?.cover_url;
            if (data.claim_type === 3) {
              data.goods_rule.price = ((data?.goods_rule?.price || 0) / 100).toFixed(2);
            }
            if (data.life_time.term_begin_at) {
              data.life_time.term_begin_at = secToDate(data.life_time.term_begin_at, "{y}-{M}-{d}");
              data.life_time.term_end_at = secToDate(data.life_time.term_end_at, "{y}-{M}-{d}");
            }
            if(!!res?.data?.activation && Object.keys(res.data.activation).length > 0){
              data.isActivate = true;
              const _profileCard = !!data?.activation?.relation_profile_card && data?.activation?.relation_profile_card.length > 0;
              if(_profileCard){
                setRelationProfileCardID(data?.activation?.relation_profile_card[0]?.id);
                data.activation.profileCard_require = data?.activation?.relation_profile_card[0]?.required;
              }else{
                data.activation.relation_profile_card = [{ id: 0, required: false }];
              }
            }
            data.benefit_bag = data?.benefit_bag || [];
            // console.log(data,"getCardDetail");
            setForm(data);
          }else{
            setMemberCardLabel(data?.name || "");
          }
        }
      }).finally(() => {
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
  const formatBenefitList = () => {
    const _rights = form.benefit_bag.filter(benefit => benefitList.some(rights => rights.benefit_id === benefit?.benefit_info?.benefit_id));
    const _gift = form.benefit_bag.filter(benefit => benefitList.every(gift => gift.benefit_id !== benefit?.benefit_info?.benefit_id));
    setRightsList(_rights.map(item=>item.benefit_info));
    setGiftList(_gift.map(item=>item.benefit_info));
  };
  useEffect(()=>{
    if(benefitList.length > 0){
      formatBenefitList();
    }
  },[benefitList, form.benefit_bag]);

  const handleValueChange = (val, ref, father = "", index = -1) => {
    // console.log(val, ref, father, index,"handleValueChange");
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if (!!father) {
        if (index !== -1) {
          temp[father][index][ref] = val;
        } else {
          temp[father][ref] = val;
        }
      } else {
        temp[ref] = val;
      }
      return temp;
    });
  };

  // 保存
  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(_form.bgImage && !_form.cover_url) {
      Taro.showToast({ title: "请选择背景图片", icon: "none" });
      return;
    }
    delete _form.bgImage;
    if (!_form.name) {
      Taro.showToast({ title: "请输入权益卡名称", icon: "none" });
      return;
    }
    // 领取有效期
    if (_form.life_time.term_type === 1) {
      _form.life_time = {
        term_type: 1
      };
    }else if (_form.life_time.term_type === 2) {
      if (!_form.life_time.term_days) {
        Taro.showToast({ title: "请输入有效期天数", icon: "none" });
        return;
      }else{
        _form.life_time = {
          term_type: 2,
          term_days: Number(_form.life_time.term_days)
        };
      }
    }else if (_form.life_time.term_type === 3) {
      if (!_form.life_time.term_begin_at || !_form.life_time.term_end_at) {
        if (!_form.life_time.term_begin_at) {
          Taro.showToast({ title: "请选择开始日期", icon: "none" });
        }
        if (!_form.life_time.term_end_at) {
          Taro.showToast({ title: "请选择结束日期", icon: "none" });
        }
        return;
      }else{
        const start_time = new Date(_form.life_time.term_begin_at).getTime();
        const end_time = new Date(_form.life_time.term_end_at).getTime();
        if(start_time > end_time){
          Taro.showToast({ title: "卡有效期结束日期不能小于开始日期", icon: "none" });
          return;
        }else{
          _form.life_time = {
            term_type: 3,
            term_begin_at: getTimeStamp(_form.life_time.term_begin_at),
            term_end_at: getTimeStamp(_form.life_time.term_end_at)
          };
        }
      }
    }

    // 领取条件
    if (_form.claim_type === 2) {
      _form.claim_meet = _form.claim_meet.filter(item => {
        return !!item.meet_value;
      });
      if(_form.claim_meet.length === 0){
        Taro.showToast({ title: "请至少设置一项领取条件", icon: "none" });
        return;
      }else{
        _form.claim_meet = _form.claim_meet.map(item => {
          if (item.meet_type === 2) {
            item.meet_value = parseFloat(item.meet_value) * 100;
          } else {
            item.meet_value = parseInt(item.meet_value);
          }
          return item;
        });
      }
    }else{
      _form.claim_meet = [];
    }
    if (_form.claim_type === 3) {
      if(!_form.goods_rule.price){
        Taro.showToast({ title: "请输入领取条件价格", icon: "none" });
        return;
      }else{
        _form.goods_rule.price = parseFloat(_form.goods_rule.price) * 100;
      }
      if(!_form.goods_rule.stock_num){
        Taro.showToast({ title: "请输入领取条件所剩库存", icon: "none" });
        return;
      }else{
        _form.goods_rule.stock_num = parseInt(_form.goods_rule.stock_num);
      }
    } else {
      delete _form.goods_rule;
    }

    if(_form.repeat_limit.is_repeatable === 2){
      if(!_form.repeat_limit.repeatable_limit){
        Taro.showToast({ title: "请输入限制次数", icon: "none" });
        return;
      }else{
        _form.repeat_limit.repeatable_limit = parseInt(_form.repeat_limit.repeatable_limit);
        if(_form.repeat_limit.repeatable_limit < 1 || _form.repeat_limit.repeatable_limit > 100){
          Taro.showToast({ title: "限制次数只能为1-100之间的整数", icon: "none" });
          return;
        }
      }
    }
    if(_form.store.length === 0){
      Taro.showToast({ title: "请选择适用店铺", icon: "none" });
      return;
    }

    _form.benefit_bag = [];
    if(giftList.length > 0){
      _form.benefit_bag = _form.benefit_bag.concat(fixBenefitList(giftList));
    }
    if(rightsList.length > 0){
      _form.benefit_bag = _form.benefit_bag.concat(fixBenefitList(rightsList));
    }

    if(_form.isActivate){
      if(!!relationProfileCardID){
        _form.activation.relation_profile_card[0].id = relationProfileCardID;
        _form.activation.relation_profile_card[0].required = _form.activation.profileCard_require;
      }else{
        delete _form.activation.relation_profile_card;
      }
    }else{
      _form.activation = {};
    }
    delete _form.activation.profileCard_require;
    delete _form.activation.profile;
    delete _form.activation.isActivate;

    if(form.overdue !== -1){
      if(!form.overdue){
        Taro.showToast({ title: "请选择此卡过期后变更的权益卡", icon: "none" });
        return;
      }
    }

    console.log(_form,"_form");

    // return;


    // console.log(giftList,"giftList");
    // console.log(rightsList,"rightsList");
    // console.log(_form.benefit_bag,"benefit_bag");

    setLoading(true);
    const action = !!_form.id ? "edit" : "add";
    console.log(_form,"_form");
    customerApi.benefitCard[action](_form)
      .then((res) => {
        console.log(res,"res");
        if (res?.code === 0) {
          eventCenterTrigger("memberCard");
          navigateTo({ method: "navigateBack", delta: !!_form.id ? 2 : 1 });
        }else{
          Taro.showToast({ title: res?.message || "保存失败", icon: "error" });
        }
      })
      .catch(res=>{
        Taro.showToast({ title: res?.message || "保存失败", icon: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [bem] = createNamespace("card", "member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
        <ScrollView style={scrollViewStyle()}>
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
              <View className={classnames(bem("genre"))} style={{ paddingLeft: addUnit(20) }}>
                <Tag
                  plain={false}
                  size="large"
                  style={{ color: "#fff", fontWeight: "bold", backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  {form.claim_type === 1 ? "无门槛卡" : form.claim_type === 2 ? "规则卡" : form.claim_type === 3 ? "付费卡" : null}
                </Tag>
              </View>
              <Cell
                border={false}
                title={form.name}
                textStyle={{ color: "#fff", fontWeight: "bold", fontSize: addUnit(18) }}
                label={form.life_time.term_type === 3 && form.life_time.term_begin_at ? "有效期：" + form.life_time.term_begin_at + "~" + form.life_time.term_end_at : formatLifeTime(form.life_time, form.expire_at)}
                labelStyle={{ color: "rgba(255,255,255,.5)" }}
                style={{ paddingLeft: addUnit(20), paddingTop: addUnit(16) }}
              />
            </View>
            <View className={classnames(bem("color"))}>
              {colors.map((color, index) => {
                return (
                  <View
                    key={`color-${index}`}
                    className={classnames(bem("color-item"))}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleValueChange(color, "color_code");
                    }}
                  >
                    {form.color_code === color ? (
                      <View className={classnames(bem("color-check"))} />
                    ) : null}
                  </View>
                );
              })}
            </View>
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
                required
                title="背景图片"
                input={false}
                arrow
                clickable
                onClick={() => {
                  navigateTo({ method: "navigateTo", url: "/pages/shop/material/index", params: { refs: "materialCardEdit" } });
                }}
              >
              </Field>
            ) : null}
          </View>
          <View className="card">
            <Field
              required
              title="卡名称"
              titleWidth={90}
              value={form.name}
              placeholder="最多输入9个字符"
              onChange={(val) => { handleValueChange(val, "name"); }}
            />
            <Field
              title="卡有效期"
              titleWidth={90}
              input={false}
              value={["永久有效", "领取后有效", "固定日期"][form.life_time.term_type - 1]}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["永久有效", "领卡当日开始计算有效期", "固定日期"],
                  success: function (res) {
                    console.log(res.tapIndex, "res.tapIndex");
                    handleValueChange(res.tapIndex + 1, "term_type", "life_time");
                  },
                  fail: function (res) {
                    console.log(res.errMsg);
                  }
                });
              }}
            />
            {form.life_time.term_type === 2 ? (
              <Field
                title="有效期天数"
                titleWidth={90}
                required
                type="digit"
                value={form.life_time.term_days}
                placeholder="请输入有效期天数"
                onChange={(val) => { handleValueChange(val, "term_days", "life_time"); }}
              />
            ) : form.life_time.term_type === 3 ? (
              <React.Fragment>
                <Picker
                  mode="date"
                  value={form.life_time.term_begin_at}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e) => {
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time, "term_begin_at", "life_time");
                  }}
                >
                  <Cell
                    title="开始日期"
                    titleStyle={{ width: addUnit(90) }}
                    contentStyle={!form?.life_time?.term_begin_at ? { color: "#ccc" } : {}}
                    content={form?.life_time?.term_begin_at || "请选择开始日期"}
                    contentAlign="left"
                    arrow
                  />
                </Picker>
                <Picker
                  mode="date"
                  value={form.life_time.term_end_at}
                  start={!!form.life_time.term_begin_at ? form.life_time.term_begin_at : secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  onChange={(e) => {
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time, "term_end_at", "life_time");
                  }}

                >
                  <Cell
                    title="结束日期"
                    titleStyle={{ width: addUnit(90) }}
                    contentStyle={!form?.life_time?.term_end_at ? { color: "#ccc" } : {}}
                    content={form?.life_time?.term_end_at || "请选择结束日期"}
                    contentAlign="left"
                    arrow
                  />
                </Picker>
              </React.Fragment>
            ) : null}
            <Field
              title="领取条件"
              titleWidth={90}
              input={false}
              value={["可直接领取", "满足下列任一条件即到账", "需付费购买"][form.claim_type - 1]}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["可直接领取", "满足下列任一条件即到账", "需付费购买"],
                  success: function (res) {
                    handleValueChange(res.tapIndex + 1, "claim_type");
                  },
                  fail: function (res) {
                    console.log(res.errMsg);
                  }
                });
              }}
            />
            {form.claim_type === 2 ? (
              <React.Fragment>
                <Field
                  title="累计支付成功"
                  titleWidth={90}
                  type="digit"
                  value={form.claim_meet[0].meet_value}
                  placeholder="请输入数字"
                  onChange={(val) => { handleValueChange(val, "meet_value", "claim_meet", 0); }}
                  right="笔"
                />
                <Field
                  title="累计消费金额"
                  titleWidth={90}
                  type="number"
                  value={form.claim_meet[1].meet_value}
                  placeholder="请输入数字"
                  onChange={(val) => { handleValueChange(val, "meet_value", "claim_meet", 1); }}
                  right="元"
                />
                <Field
                  title="累计总积分为"
                  titleWidth={90}
                  type="digit"
                  value={form.claim_meet[2].meet_value}
                  placeholder="请输入数字"
                  onChange={(val) => { handleValueChange(val, "meet_value", "claim_meet", 2); }}
                  right="分"
                />
              </React.Fragment>
            ) : form.claim_type === 3 ? (
              <React.Fragment>
                <Field
                  required
                  title="价格"
                  titleWidth={90}
                  type="number"
                  value={form.goods_rule.price}
                  placeholder="请输入金额"
                  onChange={(val) => { handleValueChange(val, "price", "goods_rule"); }}
                  right="元"
                />
                <Field
                  required
                  title="库存"
                  titleWidth={90}
                  type="digit"
                  value={form.goods_rule.stock_num}
                  placeholder="请输入库存"
                  onChange={(val) => { handleValueChange(val, "stock_num", "goods_rule"); }}
                  right="件"
                />
                <Field
                  title="商品编码"
                  titleWidth={90}
                  value={form.goods_rule.goods_no}
                  placeholder="请输入商品编码"
                  onChange={(val) => { handleValueChange(val, "goods_no", "goods_rule"); }}
                />
              </React.Fragment>
            ) : null}
            <Field
              title="每人限领次数"
              titleWidth={90}
              input={false}
              value={["不限次数", "有效期内限领次数"][form.repeat_limit.is_repeatable - 1]}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["不限次数", "有效期内限领次数"],
                  success: function (res) {
                    handleValueChange(res.tapIndex + 1, "is_repeatable", "repeat_limit");
                  },
                  fail: function (res) {
                    console.log(res.errMsg);
                  }
                });
              }}
            />
            {form.repeat_limit.is_repeatable === 2 ? (
              <React.Fragment>
                <Field
                  title="限制次数"
                  required
                  titleWidth={90}
                  type="digit"
                  maxlength={100}
                  value={form.repeat_limit.repeatable_limit}
                  placeholder="请输入1-100之间的整数"
                  onChange={(val) => { handleValueChange(val, "repeatable_limit", "repeat_limit"); }}
                />
              </React.Fragment>
            ) : null}
            {mainStore === 1 ? (
              <React.Fragment>
                <Field
                  title="适用店铺"
                  titleWidth={90}
                  input={false}
                  value={form.store.indexOf(-1) > -1 ? "全部店铺" : "指定店铺"}
                  arrow
                  clickable
                  onClick={() => {
                    Taro.showActionSheet({
                      itemList: ["全部店铺", "指定店铺"],
                      success: function (res) {
                        if (res.tapIndex === 0) {
                          handleValueChange([-1], "store");
                        } else {
                          handleValueChange([], "store");
                        }
                      },
                      fail: function (res) {
                        console.log(res.errMsg);
                      }
                    });
                  }}
                />
                {form.store.indexOf(-1) === -1 ? (
                  <React.Fragment>
                    <Cell
                      title="选择店铺"
                      titleStyle={{ width: addUnit(90) }}
                      contentAlign="left"
                      contentStyle={form.store.length > 0 ? {} : { color: "#ccc" }}
                      content={form.store.length > 0 ? `已选择(${form.store.length})家店铺` : "请选择店铺"}
                      arrow
                      clickable
                      onClick={() => {
                        navigateTo({ url: "/pages/com/store-select/index", method: "navigateTo", params: { ids: form.store, refs: "memberCardSelect", type: "store", multiple: true } });
                      }}
                    />
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : null}
          </View>
          <View className="card-title">权益礼包</View>
          <View className="card">
            <Cell
              title="设置权益"
              extra={rightsList.length > 0 ? "已设置" : ""}
              arrow
              clickable
              onClick={() => {
                navigateTo({ url: "/pages/com/benefit-select/index", method: "navigateTo", params: { select: rightsList, type: 1, mode: "rights", refs: "memberCardSelect" } });
              }}
            />
            <Cell
              title="设置礼包"
              extra={giftList.length > 0 ? "已设置" : ""}
              arrow
              clickable
              onClick={() => {
                navigateTo({ url: "/pages/com/benefit-select/index", method: "navigateTo", params: { select: giftList, type: 2, mode: "gifts", refs: "memberCardSelect" } });
              }}
            />
          </View>
          <View className="card-title">激活设置</View>
          <View className="card">
            <Cell
              title="需要激活资料"
              extra={
                <Switch
                  checked={form.isActivate}
                  onChange={(val)=>{ handleValueChange(val,"isActivate");}}
                />
              }
            />
            {form.isActivate ? (
              <React.Fragment>
                <Cell
                  title="验证手机号"
                  label="买家领取卡片需填写手机号"
                  labelStyle={{ marginTop: 0, lineHeight: addUnit(14) }}
                  extra={
                    <Switch
                      checked={form.activation.require_mobile}
                      activeValue={1}
                      inactiveValue={0}
                      onChange={(val)=>{ handleValueChange(val,"require_mobile", "activation");}}
                    />
                  }
                />
                <Field
                  title="关联档案卡"
                  titleWidth={90}
                  input={false}
                  value={profileCardLabel}
                  placeholder="请选择要关联的档案卡（选填）"
                  arrow
                  onClick={() => {
                    navigateTo({ url: "/pages/com/profile-card-select/index", method: "navigateTo", params: { ids: [relationProfileCardID], type: "profileCard", refs: "memberCardSelect", multiple: true, max: 1 } });
                  }}
                />
                {form.activation.relation_profile_card && form.activation.relation_profile_card.length > 0 ? (
                  <Cell
                    title="关联的档案卡是否必填"
                    extra={
                      <Switch
                        checked={form.activation.profileCard_require}
                        onChange={(val)=>{ handleValueChange(val,"profileCard_require", "activation");}}
                      />
                    }
                  />
                ) : null}
                <Field
                  title="关联资料项"
                  titleWidth={90}
                  input={false}
                  value={form.activation.relation_profile.length > 0 ? `已关联${form.activation.relation_profile.length}项` : ""}
                  placeholder="请选择要关联的资料项（选填）"
                  arrow
                  onClick={() => {
                    navigateTo({ url: "/pages/com/profile-select/index", method: "navigateTo", params: { select: form?.activation?.relation_profile, type: "profile", refs: "memberCardSelect" } });
                  }}
                />
              </React.Fragment>
            ) : null}
          </View>
          <View className="card-title">其它设置</View>
          <View className="card">
            <Cell
              title="此卡过期后"
              titleStyle={{ width: addUnit(90) }}
              content={form.overdue === -1 ? "变更为失效" : "消费者变更至其它权益卡"}
              contentAlign="left"
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["变更为失效", "消费者变更至其它权益卡"],
                  success: function (res) {
                    if (res.tapIndex === 0) {
                      handleValueChange(-1, "overdue");
                    } else {
                      handleValueChange(null, "overdue");
                      setMemberCardLabel("");
                    }
                  },
                  fail: function (res) {
                    console.log(res.errMsg);
                  }
                });
              }}
            />
            {form.overdue !== -1 ? (
              <Field
                required
                title="变更为"
                titleWidth={90}
                input={false}
                value={memberCardLabel}
                placeholder="请选择其它权益卡"
                arrow
                clickable
                onClick={() => {
                  navigateTo({ url: "/pages/com/member-card-select/index", method: "navigateTo", params: { ids: form.overdue, refs: "memberCardSelect", type: "memberCard" } });
                }}
              />
            ) : null}
          </View>
          <View className="card">
            <Field
              title="客服电话"
              titleWidth={90}
              value={form.service_phone}
              placeholder="请输入手机号或固定电话"
              onChange={(val) => { handleValueChange(val, "service_phone"); }}
            />
            <Field
              title="使用须知"
              titleRow
              type="textarea"
              value={form.description}
              maxlength={255}
              showWordLimit
              placeholder="请输入权益卡相关的补充信息，最多可输入255个字符"
              onChange={(val) => { handleValueChange(val, "description"); }}
            />
          </View>
          {(mainStore > 2 && approval === "1") || form.state === 3 ? (
            <React.Fragment>
              <View className="card-title">向总店申请理由</View>
              <View className="card">
                <Field
                  border={false}
                  title="申请理由"
                  titleWidth={90}
                  titleRow
                  type="textarea"
                  value={form.reason}
                  maxlength={255}
                  showWordLimit
                  placeholder="向总店申请创建优惠券的原因，方便总店审批"
                  onChange={(val) => {
                    handleValueChange(val, "reason");
                  }}
                />
              </View>
            </React.Fragment>
          ) : null}
        </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar direction="column" style={{ paddingBottom: 0 }}>
        <Button
          style={{ width: "70%" }}
          type="info"
          loading={loading}
          onClick={saveClick}
        >
          保存
        </Button>
        <View
          style={{
            marginTop: addUnit(8),
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ fontSize: addUnit(11), color: "#999" }}>保存即表示你已阅读并同意与消费者的</Text>
          <Text
            style={{ fontSize: addUnit(11), color: "#0080ff" }}
            onClick={() => {
              Taro.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/paidCard/&title=权益卡使用协议` });
            }}
          >
            《权益卡使用协议》
          </Text>
        </View>
      </BottomBar>
    </View>
  );
};

export default MemberCardEdit;
