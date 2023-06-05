import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Text, Image, Picker } from "@tarojs/components";
import { customerApi } from "@/api/co_admin";
import { addUnit, createNamespace, formatNumber, scrollViewStyle } from "@/components/utils";
import { formatLifeTime } from "@/pageSub/customer/pages/memberCard/utils"
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { secToDate } from "@/utils/common";
import { base } from "@/api/config";
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tabs from "@/components/tabs";
import Tag from "@/components/tag";
import Radio from "@/components/radio";
import classnames from "classnames";
import "../../memberCard/detail/index.scss";
import "./index.scss";

const CustomerBatch: FC = () => {
  const _params:any = getCurrentInstance().router?.params;

  const init = {
    ban: {
      // 禁止功能 (方式 5使用)
      buy: 0, // 购买 0忽略 1禁止 2取消禁止
      chat: 0 // 发起会话 0忽略 1禁止 2取消禁止
    },
    batch_point: {
      // 企业客户用户列表 (方式 2使用)
      note: "", // 备注原因
      points: null // 1积分 需要添加的积分 (-1 代表减 1 积分 0清空积分)
    },
    cards_id: null, // 权益卡ID (方式 3使用)
    customers: [], // 企业客户用户列表ID
    level: {
      // 会员等级 (方式 4使用)
      level_id: null, // 会员等级ID
      term_days: null // 有效期 天数 （收费会员需要）
    },
    tag_ids: [], // 标签列表 (方式 1使用)
    type: 1, // 操作方式 1标签 2积分 3发权益卡 4会员等级 5黑名单
    remind: {
      aid: 0, // 提醒关联id 如档案卡ID
      customer_id: 0, // 用户对于店铺的ID
      note: "",  // 提醒内容
      remind_at_date: "", // 提醒日期
      remind_at_time: "", // 提醒时间
      type: 1 // 提醒类型 1固定内容 2档案卡提醒
    }
  };

  const [form, setForm] = useState<any>(init);
  useEffect(() => {
    setForm(()=>{
      let _form = Object.assign({}, init);
      if(!!_params && !!_params.ids && !!_params.type){
        const _type = JSON.parse(_params.type);
        const _ids = JSON.parse(_params.ids);
        const _title = _type === 2 ? "给积分" : _type === 3 ? "选择权益卡" : _type === 4 ? "选择会员等级" : _type === 6 ? "添加提醒任务" : "";
        _form.customers = _ids;
        Taro.setNavigationBarTitle({ title: _title });
        setActionObj(_type,"type");
        if(_type === 3){
          getMemberCardList();
        }else if(_type === 4){
          setActionObj(1,"levelType");
          getVipList(1);
        }else if(_type === 6){
          setActionObj(1,"remindType");
          getCustomCards(_ids[0]);
        }
      }
      return _form;
    });
  }, []);

  // 获取权益卡列表
  const getMemberCardList = () => {
    if(action.memberCardList.length === 0){
      setActionObj(true, "loading");
      customerApi.benefitCard.page({ page: 1, page_size: 999, state: 1 }).then(res => {
        if (!!res && res.code === 0) {
          setActionObj(res?.data?.list || [], "memberCardList");
        }
      }).finally(() => {
        setActionObj(false, "loading");
      });
    }
  };
  // 获取会员等级列表
  const getVipList = (type)=>{
    if((action.vipList.length === 0 && type === 1) || (action.svipList.length === 0 && type === 2)) {
      setActionObj(true, "loading");
      customerApi.level.page({ page: 1, page_size: 999, type: type, order_key: "+created_at" }).then(res => {
        if (!!res && res.code === 0) {
          setActionObj(res?.data?.list || [], type === 1 ? "vipList" : "svipList");
          setActionObj(res?.data?.list || [], "levelList");
        }
      }).finally(() => {
        setActionObj(false, "loading");
      });
    }else{
      if(type === 1) {
        setActionObj(action.vipList, "levelList");
      }else if(type === 2){
        setActionObj(action.svipList, "levelList");
      }
    }
  };

  // 获取档案卡
  const getCustomCards = (id) => {
    if(action.customerCardList.length === 0){
      setActionObj(true, "loading");
      customerApi.fileCard.page({ customer_id: id, page: 1, page_size: 99 }).then(res => {
        if (res.code === 0) {
          setActionObj(res?.data?.list || [], "customerCardList");
        }
      }).finally(() => {
        setActionObj(false, "loading");
      });
    }
  };

  const [action, setAction] = useState<any>({
    loading: false,
    type: 0,
    memberCardList: [],
    remindTabs: [
      { label: "指定内容提醒", value: 1 },
      { label: "档案卡提醒", value: 2 }
    ],
    customerCardList: [],
    levelTabs: [
      { label: "免费会员", value: 1 },
      { label: "付费会员", value: 2 }
    ],
    levelType: 1,
    levelList: [],
    vipList : [],
    svipList : []
  });
  const setActionObj = (val, refs) =>{
    setAction(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[refs] = val;
      return temp;
    });
  };
  const handelBack = () => {
    setAction(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.loading = false;
      temp.type = 2;
      temp.levelType = 1;
      return temp;
    });
    setForm(init);
    eventCenterTrigger("customer");
    navigateTo({ method:"navigateBack" });
  };
  const handleSave = (type, id = 0) => {
    let _form = JSON.parse(JSON.stringify(form));

    if(type === 2){
      if(!_form.batch_point.points){
        Taro.showToast({ title: "积分不能为空", icon: "none" });
        return;
      }else{
        _form.batch_point.points = parseInt(_form.batch_point.points);
      }
      if(!_form.batch_point.note){
        Taro.showToast({ title: "备注理由不能为空", icon: "none" });
        return;
      }
      let _formTemp = {
        type: 2,
        customers: _form.customers,
        batch_point: {
          note: _form.batch_point.note,
          points: _form.batch_point.points
        }
      };
      batchSave(_formTemp, 2);
    }
    if(type === 3){
      _form.cards_id = id;
      let _formTemp = {
        type: 3,
        customers: _form.customers,
        cards_id: id
      };
      batchSave(_formTemp, 3);
    }
    if(type === 4){
      _form.level.level_id = id;
      let _formTemp:any = {
        type: 4,
        customers: _form.customers,
        level: {
          level_id: id
        }
      };
      if (action.levelType === 2) {
        customerApi.level.get({ id }).then(resp => {
          if(resp.code === 0){
            _formTemp.level.term_days = resp.data?.vip_rule[0]?.term_days;
            batchSave(_formTemp, 4);
          }
        });
      }else{
        batchSave(_formTemp, 4);
      }
    }
    if(type === 6){
      _form.remind.customer_id = _form.customers[0];
      if(!_form.remind.remind_at_date){
        Taro.showToast({ title:"请选择提醒日期", icon: "none" });
        return;
      }
      if(!_form.remind.remind_at_time){
        Taro.showToast({ title:"请选择提醒时间", icon: "none" });
        return;
      }
      _form.remind.remind_at_time = _form.remind.remind_at_date + " " + _form.remind.remind_at_time + ":00";
      delete _form.remind.remind_at_date;

      if(_form.remind.type === 2){
        if(!_form.remind.aid){
          Taro.showToast({ title:"请选择档案卡", icon: "none" });
          return;
        }
      }else{
        _form.remind.aid = null;
      }
      if(!_form.remind.note){
        Taro.showToast({ title:"提醒内容不能为空", icon: "none" });
        return;
      }
      batchSave(_form.remind, 6);
    }
  };
  const batchSave = (form, type) => {
    if(type === 2 || type === 6){
      setActionObj(true, "loading");
    }
    if(type === 6){
      customerApi.remind.add(form)
        .then(resp => {
          if(resp.code === 0){
            Taro.showToast({ title: "设置成功" });
            handelBack();
          }else{
            // console.log(resp.message,"resp");
            Taro.showToast({ title: resp.message, icon: "none" });
          }
        })
        .catch(resp=>{
          Taro.showToast({ title: resp.message, icon: "none" });
        })
        .finally(() => {
          setActionObj(false, "loading");
        });
    }else{
      customerApi.customer.operate(form)
        .then(resp => {
          // console.log(resp,"resp");
          if(resp.code === 0){
            Taro.showToast({ title: "设置成功" });
            handelBack();
          }else{
            // console.log(resp.message,"resp");
            Taro.showToast({ title: resp.message, icon: "none" });
          }
        })
        .catch(resp=>{
          Taro.showToast({ title: resp.message, icon: "none" });
        })
        .finally(() => {
          setActionObj(false, "loading");
        });
    }
  };
  const findName = (id, list, type = "profile_name", find = "id") => {
    let arr = list;
    if (arr.length > 0) {
      const item = arr.find(item => {
        return id === item[find];
      });
      if (type && item) return item[type];
    }
    return "";
  };

  const [bem] = createNamespace("card","member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {action.type === 4 ? (
        <Tabs
          border
          bgColor="#fff"
          active={action.levelType}
          options={action.levelTabs}
          onChange={(val)=>{
            setActionObj(val,"levelType");
            getVipList(val);
          }}
        />
      ) : action.type === 6 ? (
        <Tabs
          border
          bgColor="#fff"
          active={form.remind.type}
          options={action.remindTabs}
          onChange={(val)=>{
            setForm(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp.remind.type = val;
              return temp;
            });
          }}
        />
      ) : null}
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        {action.type === 2 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Field
                border={false}
                required
                title="积分"
                type="text"
                value={form.batch_point.points}
                placeholder="请输入要加/减的积分值"
                onChange={(val)=>{
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.batch_point.points = formatNumber(val, false, true);
                    return temp;
                  });
                }}
              />
            </View>
            <View className="card-tips">-1代表减积分，1代表加积分，0代表清空积分</View>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Field
                border={false}
                required
                title="原因"
                type="textarea"
                value={form.batch_point.note}
                placeholder="备注理由"
                onChange={(val)=>{
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.batch_point.note = val;
                    return temp;
                  });
                }}
              />
            </View>
            <View className="bottom-bar">
              <Button
                loading={action.loading}
                style={{ width: "70%" }}
                type="info"
                onClick={()=>{handleSave(2);}}
              >
                确定
              </Button>
            </View>
          </React.Fragment>
        ) : action.type === 3 ? (
          <React.Fragment>
            {action.loading ? (
              <React.Fragment>
                {Array(8)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        card
                        image
                        imageSize={24}
                        imageShape="round"
                        title
                        row={1}
                        rowWidth={160}
                      />
                    );
                  })}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {action.memberCardList.length > 0 ? (
                  <React.Fragment>
                    {action.memberCardList.map((item:any,index)=>{
                      return (
                        <View className="card" key={`memberCard-${item.id}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                          <Radio
                            border={index !== 0}
                            cell
                            labelPosition="right"
                            label={
                              <React.Fragment>
                                <Tag
                                  mark
                                  style={{ marginRight: addUnit(8) }}
                                  plain={false}
                                  type={item.state === 1 ? (item.claim_type === 1 ? "success" : item.claim_type === 2 ? "warning" : item.claim_type === 3 ? "primary" : "default") : "default"}
                                >
                                  {item.claim_type === 1 ? "无门槛卡" : item.claim_type === 2 ? "规则卡" : item.claim_type === 3 ? "付费卡" : null}
                                </Tag>
                                <Text style={{ fontSize: addUnit(16) }}>{item.name}</Text>
                              </React.Fragment>
                            }
                            labelStyle={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center"
                            }}
                            desc={
                              <React.Fragment>
                                <View className="hairline hairline--top" />
                                <Text style={{ fontSize: addUnit(12), color: "#666" }} >
                                  {formatLifeTime(item.life_time, item.expire_at)}
                                </Text>
                              </React.Fragment>
                            }
                            descStyle={{
                              position: "relative",
                              marginTop: addUnit(10),
                              paddingTop: addUnit(8)
                            }}
                            value={item.id}
                            checked={form.cards_id === item.id}
                            onChange={(val)=>{
                              handleSave(3, val);
                            }}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关权益卡" image="memberCard" />
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        ) : action.type === 4 ? (
          <React.Fragment>
            {action.loading ? (
              <React.Fragment>
                {Array(8)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        card
                        image
                        imageSize={24}
                        imageShape="round"
                        title
                        row={1}
                        rowWidth={160}
                      />
                    );
                  })}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {action.levelList.length > 0 ? (
                  <React.Fragment>
                    {action.levelList.map((item: any, index) => {
                      if(item.state === 2) return null;
                      return (
                        <Radio
                          className="card"
                          key={index}
                          style={{
                            marginTop: index === 0 ? addUnit(12) : 0,
                            paddingLeft: addUnit(14),
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center"
                          }}
                          value={item.id}
                          checked={form.level.level_id === item.id}
                          onChange={(val)=>{
                            handleSave(4, val);
                          }}
                        >
                          <Cell
                            border={false}
                            align="start"
                            iconStyle={{ marginRight: addUnit(12) }}
                            icon={
                              <View
                                className={classnames(bem("card"))}
                                style={{
                                  width: addUnit(72),
                                  height: addUnit(44),
                                  borderRadius: addUnit(4)
                                }}
                              >
                                <View
                                  className={classnames(bem("backdrop"))}
                                  style={{ backgroundColor: item.color_code || "#646666" }}
                                >
                                  <Tag
                                    plain={false}
                                    mark
                                    size="small"
                                    textColor="#fff"
                                    color="rgba(255,255,255,.3)"
                                    style={{
                                      fontWeight: "bold",
                                      position: "absolute",
                                      left: addUnit(4),
                                      top: addUnit(4)
                                    }}
                                  >
                                    {`${ item.type === 1 ? "VIP" : "SVIP"}${ item.type === 1 ? item.level_value : index + 1 }`}
                                  </Tag>
                                  <Image
                                    className={classnames(bem("backdrop-watermark"))}
                                    src={item.type === 1 ? require("@/assets/card/level-vip.png") : require("@/assets/card/level-svip.png")}
                                    mode="aspectFill"
                                    style={{ width: addUnit(48), height: addUnit(40) }}
                                  />
                                  {item.cover_url && item.cover_url !== "" && item.cover_url !== "string" ? (
                                    <Image className={classnames(bem("backdrop-image"))} src={base.file_host + "/" + item.cover_url} mode="aspectFill" />
                                  ) : null}
                                </View>
                              </View>
                            }
                            title={item.name}
                            textStyle={{ fontSize: addUnit(16), fontWeight: "bold", color: "#333" }}
                            label={item.type === 1 ? `需注册会员${ item?.free_growth || 0 }成长值` : undefined}
                            labelStyle={{ fontSize: addUnit(13), color: "#666" }}
                          />
                        </Radio>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关会员卡" image="memberCard" />
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        ) : action.type === 6 ? (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Picker
                mode="date"
                value={form.remind.remind_at_date}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e) => {
                  const time = e.detail.value.replace(/\//g, "-");
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.remind.remind_at_date = time;
                    return temp;
                  });
                }}
              >
                <Cell
                  border={false}
                  title="提醒日期"
                  titleStyle={{ width: addUnit(90) }}
                  content={!!form.remind.remind_at_date ? form.remind.remind_at_date : "请选择提醒日期"}
                  contentAlign="left"
                  contentStyle={!!form.remind.remind_at_date ? {} : { color: "#ccc" }}
                  arrow
                />
              </Picker>
              <Picker
                mode="time"
                value={form.remind.remind_at_time}
                start={secToDate(new Date().getTime(),"{h}-{m}")}
                onChange={(e) => {
                  const time = e.detail.value.replace(/\//g, "-");
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.remind.remind_at_time = time;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="提醒时间"
                  titleStyle={{ width: addUnit(90) }}
                  content={!!form.remind.remind_at_time ? form.remind.remind_at_time : "请选择提醒时间"}
                  contentAlign="left"
                  contentStyle={!!form.remind.remind_at_time ? {} : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </View>
            {form.remind.type === 2 ? (
              <View className="card">
                {action.customerCardList.length > 0 ? (
                  <Picker
                    mode="selector"
                    range={action.customerCardList.map(item=>item.profile_name)}
                    onChange={(e)=>{
                      const index = e.detail.value;
                      const val = action.customerCardList[index].id;
                      setForm(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp.remind.aid = val;
                        return temp;
                      });
                    }}
                  >
                    <Field
                      border={false}
                      required
                      title="档案卡"
                      titleWidth={90}
                      input={false}
                      value={findName(form.remind.aid, action.customerCardList)}
                      placeholder="请选择档案卡"
                      arrow
                      clickable
                    />
                  </Picker>
                ) : (
                  <Field
                    border={false}
                    required
                    title="档案卡"
                    titleWidth={90}
                    input={false}
                    placeholder="请选择档案卡"
                    arrow
                    clickable
                    onClick={()=>{
                      Taro.showToast({ title:"暂无档案卡可选", icon: "none" });
                    }}
                  />
                )}
              </View>
            ) : null}
            <View className="card">
              <Field
                border={false}
                required
                title="提醒内容"
                titleRow
                type="textarea"
                value={form.remind.note}
                placeholder="请输入提醒内容"
                onChange={(val)=>{
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.remind.note = val;
                    return temp;
                  });
                }}
              />
            </View>
            <View className="bottom-bar">
              <Button
                loading={action.loading}
                style={{ width: "70%" }}
                type="info"
                onClick={()=>{handleSave(6);}}
              >
                确定
              </Button>
            </View>
          </React.Fragment>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default CustomerBatch;
