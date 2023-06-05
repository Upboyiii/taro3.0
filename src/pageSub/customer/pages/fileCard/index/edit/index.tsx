import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, Text, View, ScrollView } from "@tarojs/components";
import { customerApi } from "@/api/co_admin";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { formatLifeTime } from "@/pageSub/customer/pages/memberCard/utils"
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import Popup from "@/components/popup";
import Skeleton from "@/components/skeleton";
import Checkbox from "@/components/checkbox";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { secToDate } from "@/utils/common";

const CustomerEdit: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const _title = Object.keys(_params).length > 0 ? "编辑客户" : "添加客户";

  const init = {
    id: 0,
    data: {
      birthday: "",
      note: "",
      sex: null
    },
    name: "",
    phone: "",
    user_cards: []
  };
  const [form, setForm] = useState<any>(init);
  useEffect(() => {
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      const _temp = JSON.parse(_params?.form || {});
      let _form = Object.assign({}, init);
      if (!!_temp.info) {
        _form.id = _temp.info.id;
        _form.name = _temp.info.name || "";
        _form.phone = _temp.info.phone || "";
        if (_temp.info.data) {
          _form.data.birthday = _temp.info.data.birthday ? formatDate(_temp.info.data.birthday) : "";
          _form.data.note = _temp.info.data.note || "";
          _form.data.sex = _temp.info.data.sex || null;
        }
      }
      if (!!_temp.benefit_list && Array.isArray(_temp.benefit_list) && _temp.benefit_list.length > 0) {
        _form.user_cards = _temp.benefit_list.map(item => {
          return item.card_id;
        });
      }
      console.log(_form, "_form");
      setForm(_form);
    }
  }, []);

  const handleValueChange = (val, type, father = "") => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if (!!father) {
        temp[father][type] = val;
      } else {
        temp[type] = val;
      }
      return temp;
    });
  };

  const [loading, setLoading] = useState(false);
  const [memberCardShow, setMemberCardShow] = useState(false);
  const [memberCardList, setMemberCardList] = useState<any>([]);
  const getMemberCardList = () => {
    setMemberCardList([]);
    setLoading(true);
    customerApi.benefitCard.page({ page: 1, page_size: 999, state: 1 }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setMemberCardList(res.data.list || []);
        }
      }
    }).finally(() => {
      setLoading(false);
    });
  };
  const findMembarCardName = (userCards = []) => {
    if (userCards.length > 0 && memberCardList.length > 0) {
      let tempList = "";
      userCards.forEach(useId => {
        memberCardList.forEach(card => {
          if (useId === card.id) {
            tempList += card.name + "；";
          }
        });
      });
      return tempList;
    }
    return "";
  };

  // 保存
  const onSubmit = () => {
    let verify = true;
    if (!form.name) {
      Taro.showToast({ title: "请填写客户姓名", icon: "none" });
      return false;
    }
    const phoneReg = /^1[3456789]\d{9}$/;
    if (!phoneReg.test(form.phone)) {
      Taro.showToast({ title: "请输入正确的手机号码", icon: "none" });
      return false;
    }
    if (!verify) return;

    setLoading(true);
    const action = !!form.id ? "edit" : "add";
    customerApi.customer[action](form).then(res => {
      if (res.code === 0) {
        eventCenterTrigger("customer");
        navigateTo({ method: "navigateBack" });
      } else {
        Taro.showToast({ title: res.message, icon: "none" });
      }
    }).catch(res => {
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(() => {
      setLoading(false);
    });
  };

  // 删除
  // @ts-ignore
  const onDelete = () => {
    Taro.showModal({
      title: "是否删除？",
      content: "是否删除客户？",
      cancelText: "我再想想",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          customerApi.customer.delete({ id: form.id }).then(res => {
            if (res.code === 0) {
              eventCenterTrigger("customer");
              navigateTo({ method: "navigateBack" });
            } else {
              Taro.showToast({ title: res.message, icon: "none" });
            }
          }).catch(res => {
            Taro.showToast({ title: res.message, icon: "none" });
          }).finally(() => {
            setLoading(false);
          });
        }
      }
    });
  };

  // 日期转换
  const formatDate = (dateString: any) => {
    return dateString.slice(0, 10);
  };
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            required
            border={false}
            title="姓名"
            titleWidth={90}
            value={form.name}
            placeholder="输入客户姓名"
            onChange={(val) => { handleValueChange(val, "name"); }}
          />
          {!_params?.form?.info?.phone ? (
            <Field
              required
              title="手机号码"
              titleWidth={90}
              type="tel"
              value={form.phone}
              placeholder="输入手机号码"
              onChange={(val) => { handleValueChange(val, "phone"); }}
            />
          ) : null}
          <Field
            title="备注"
            titleWidth={90}
            type="textarea"
            value={form.data.note}
            placeholder="输入备注"
            onChange={(val) => { handleValueChange(val, "note", "data"); }}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            title="性别"
            titleWidth={90}
            input={false}
            value={form.data.sex === 1 ? "男" : form.data.sex === 2 ? "女" : ""}
            placeholder="请选择客户性别"
            arrow
            clickable
            onClick={() => {
              Taro.showActionSheet({
                itemList: ["男", "女"],
                success: function (res) {
                  handleValueChange(res.tapIndex + 1, "sex", "data");
                }
              });
            }}
          />
          <Picker
            mode="date"
            value={form.data.birthday}
            start={secToDate(new Date(1900, 1, 1).getTime(), "{y}-{M}-{d}")}
            // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
            onChange={(e) => {
              const time = e.detail.value.replace(/\//g, "-");
              handleValueChange(time, "birthday", "data");
            }}
          >
            <Cell
              title="生日"
              titleStyle={{ width: addUnit(90) }}
              content={!!form.data.birthday ? form.data.birthday : "请选择生日"}
              contentAlign="left"
              contentStyle={!!form.data.birthday ? undefined : { color: "#ccc" }}
              arrow
            />
          </Picker>
        </View>
        {!form?.id ? (
          <View className="card">
            <Field
              border={false}
              title="权益卡"
              titleWidth={90}
              input={false}
              value={findMembarCardName(form.user_cards)}
              placeholder="请选择权益卡"
              arrow
              clickable
              onClick={() => {
                setMemberCardShow(true);
                if (memberCardList.length === 0) {
                  getMemberCardList();
                }
              }}
            />
          </View>
        ) : null}
      </ScrollView>
      <BottomBar>
        {/** 客户删除不了 **/}
        {/* {!!form?.id ? (*/}
        {/*  <React.Fragment>*/}
        {/*    <Button*/}
        {/*      loading={loading}*/}
        {/*      style={{ marginRight: addUnit(12) }}*/}
        {/*      hairline*/}
        {/*      type="primary"*/}
        {/*      onClick={onDelete}*/}
        {/*    >*/}
        {/*      删除*/}
        {/*    </Button>*/}
        {/*  </React.Fragment>*/}
        {/* ) : null}*/}
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={onSubmit}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        show={memberCardShow}
        title="选择权益卡"
        position="pageSheet"
        bgColor="#f7f8f8"
        onClose={() => { setMemberCardShow(false); }}
        action={
          <Button
            type="primary"
            style={{ width: "70%" }}
            onClick={() => { setMemberCardShow(false); }}
          >
            确定
          </Button>
        }
      >
        {loading ? (
          <React.Fragment>
            {Array(6)
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
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {memberCardList.length > 0 ? (
              <React.Fragment>
                {memberCardList.map((item, index) => {
                  return (
                    <View className="card" key={`memberCard-${item.id}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Checkbox
                        cell
                        border={index !== 0}
                        labelPosition="right"
                        label={
                          <React.Fragment>
                            <Tag
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
                        // labelStyle={form.user_cards.indexOf(item.id) > -1 ? { color: "#ff2340" } : {}}
                        checked={form.user_cards.indexOf(item.id) > -1}
                        onChange={(val) => {
                          setForm(prevState => {
                            let temp = JSON.parse(JSON.stringify(prevState));
                            if (val) {
                              if (temp.user_cards.indexOf(item.id) === -1) {
                                temp.user_cards.push(item.id);
                              }
                            } else {
                              if (temp.user_cards.indexOf(item.id) > -1) {
                                temp.user_cards.splice(temp.user_cards.indexOf(item.id), 1);
                              }
                            }
                            return temp;
                          });
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
      </Popup>
    </View>
  );
};

export default CustomerEdit;
