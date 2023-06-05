import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { applyApi, customerApi } from "@/api/co_admin";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice, getTimeStamp, secToDate } from "@/utils/common";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const PrepayEdit: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const _title = Object.keys(_params).length > 0 ? "编辑储值金额" : "添加储值金额";

  const init = {
    amount: "",
    mark: "",
    items: [],
    benefit_bag: []
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);
  const [applyID, setApplyID] = useState(0);
  const [benefitLength, setBenefitLength] = useState(0);
  const getApplyID = () => {
    setLoading(true);
    applyApi.info({ label: "reserveFund" }).then(res => {
      if (!!res && res.code === 0) {
        if(!!res?.data?.id){
          setApplyID(res?.data?.id);
          customerApi.benefit.page({ page: 1, page_size: 100, simple: true, apply_id: res?.data?.id }).then(res => {
            if (!!res && res.code === 0 && !!res.data?.list) {
              setBenefitLength(res.data?.list.length);
            }
          });
        }
      }
    }).finally(()=>{
      setLoading(false);
    });
  };
  const [benefitList, setBenefitList] = useState([]);
  const getBenefits = (id) => {
    pluginApi.plugin("GET",317, "coBenefit", JSON.stringify({ id: id }), 20462399)
      .then(res => {
        console.log(res, "getBenefits");
        if (!!res && res.code === 0) {
          console.log(res?.data, "res?.data");
          const _list = (res?.data || []).map(item => {
            return {
              benefit_id: item.benefit_info.benefit_id,
              did: item.benefit_info.did,
              value: item.benefit_info.value
            };
          });
          setBenefitList(_list);
        }
      })
      .finally(() => {});
  };

  useEffect(() => {
    getApplyID();
    setForm(init);
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || {}));
      _form.amount = formatPrice(_form.amount);
      _form.benefit_bag = [];
      if (!!_form.item && _form.item.length > 0) {
        _form.items = _form.item.map((item:any) => {
          item.discount = formatPrice(item?.discount);
          item.start_date = secToDate(item?.start_date, "{y}-{M}-{d}");
          item.end_date = secToDate(item?.end_date, "{y}-{M}-{d}");
          return item;
        });
        delete _form.item;
      }
      // =console.log(_form,"_form");
      setForm(_form);
      getBenefits(_form.id);
    }
  }, []);

  useEffect(() => {
    eventCenterOn("prepaySelect", (res) => {
      if(!!res[0]){
        setBenefitList(res[0]);
      }
    });
    return () => {
      eventCenterOff("prepaySelect");
    };
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

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!_form.amount) {
      Taro.showToast({ title: "请输入储值金额", icon: "none" });
      return;
    }else{
      _form.amount = Number(_form.amount) * 100;
    }
    if (_form.items.length > 0) {
      for(let i = 0; i < _form.items.length; i++){
        const item = _form.items[i];
        if (!item.start_date) {
          Taro.showToast({ title: "请选择开始日期", icon: "none" });
          return false;
        }
        if (!item.end_date) {
          Taro.showToast({ title: "请选择结束日期", icon: "none" });
          return false;
        }
        if (getTimeStamp(item.start_date) >= getTimeStamp(item.end_date)) {
          Taro.showToast({ title: "结束日期必须大于开始日期", icon: "none" });
          return false;
        }
        if (!item.discount) {
          Taro.showToast({ title: "请输入赠送金额", icon: "none" });
          return false;
        }else{
          item.discount = Number(item.discount) * 100;
        }
      }
    }
    if(benefitList.length > 0){
      _form.benefit_bag = benefitList.map((item:any) => {
        return {
          benefit_id: item.did,
          value: item.value
        };
      });
    }

    console.log(_form,"_form");

    setLoading(true);
    pluginApi.plugin("put", 317, "saveCoFund", JSON.stringify(_form), 20462399)
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("prepay");
          navigateTo({ method:"navigateBack" });
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

  const stateClick = (state, title) => {
    Taro.showModal({
      title: "提示",
      content: `确定${title}吗？`,
      cancelText: "我再想想",
      confirmText: `确定${title}`,
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi .plugin("PUT", 317,"updateCoFundStatus",JSON.stringify({ id: form.id, status: state }), 20462399)
            .then((res) => {
              // console.log(res,"res");
              if (!!res && res.code === 0) {
                eventCenterTrigger("prepay" );
                navigateTo({ method: "navigateBack" });
              }else{
                Taro.showToast({ title: res?.message || `${title}失败`, icon: "error" });
              }
            })
            .catch(res=>{
              Taro.showToast({ title: res?.message || `${title}失败`, icon: "error" });
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    });
  };
  const deleteClick = () => {
    Taro.showModal({
      title: "提示",
      content: "确定删除吗？",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi .plugin("DELETE", 317,"delCoFund",JSON.stringify({ id: form.id }), 20462399)
            .then((res) => {
              // console.log(res,"res");
              if (!!res && res.code === 0) {
                eventCenterTrigger("prepay" );
                navigateTo({ method: "navigateBack" });
              }else{
                Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
              }
            })
            .catch(res=>{
              Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
            })
            .finally(() => {
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
            required
            border={false}
            title="储值金额"
            titleWidth={90}
            type="number"
            value={form.amount}
            placeholder="输入储值金额"
            onChange={(val) => { handleValueChange(val, "amount"); }}
            right="元"
          />
          <Field
            title="备注说明"
            titleWidth={90}
            type="textarea"
            value={form.mark}
            placeholder="输入备注说明"
            onChange={(val) => { handleValueChange(val, "mark"); }}
          />
        </View>
        <View className="card-title">赠送类型</View>
        <View className="card">
          <Cell
            title="送储备金"
            extra={
              <Switch
                checked={form.items.length > 0}
                onChange={(val) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    if (!val) {
                      let index = temp.items.findIndex(item => {
                        return 1 === item.type;
                      });
                      if (index >= 0) {
                        temp.items.splice(index, 1);
                      }
                    } else {
                      temp.items.push({
                        name: "",
                        type: 1,
                        discount: "",
                        start_date: "",
                        end_date: ""
                      });
                    }
                    return temp;
                  });
                }}
              />
            }
          />
          {benefitLength > 0 ? (
            <Cell
              title="设置权益"
              extra={benefitList.length > 0 ? "已设置" : ""}
              arrow
              clickable
              onClick={() => {
                navigateTo({ url: "/pages/com/benefit-select/index", method: "navigateTo", params: { select: benefitList, type: 0, apply_id: applyID, refs: "prepaySelect" } });
              }}
            />
          ) : null}
        </View>
        {form.items.length > 0 ? form.items.map((item: any, index) => {
          return (
            <React.Fragment key={`song-${index}`}>
              <View className="card-title">送储备金</View>
              <View className="card">
                <Picker
                  mode="date"
                  value={item.start_date}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  onChange={(e) => {
                    const time = e.detail.value.replace(/\//g, "-");
                    setForm(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp.items[index].start_date = time;
                      return temp;
                    });
                  }}
                >
                  <Cell
                    border={false}
                    title="开始日期"
                    titleStyle={{ width: addUnit(90) }}
                    content={!!item.start_date ? item.start_date : "请选择开始日期"}
                    contentAlign="left"
                    contentStyle={!!item.start_date ? undefined : { color: "#ccc" }}
                    arrow
                  />
                </Picker>
                <Picker
                  mode="date"
                  value={item.end_date}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e) => {
                    const time = e.detail.value.replace(/\//g, "-");
                    setForm(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp.items[index].end_date = time;
                      return temp;
                    });
                  }}
                >
                  <Cell
                    title="结束日期"
                    titleStyle={{ width: addUnit(90) }}
                    content={!!item.end_date ? item.end_date : "请选择结束日期"}
                    contentAlign="left"
                    contentStyle={!!item.end_date ? undefined : { color: "#ccc" }}
                    arrow
                  />
                </Picker>
                <Field
                  title="金额"
                  titleWidth={90}
                  type="number"
                  placeholder="请输入金额"
                  right="元"
                  value={item.discount}
                  onChange={(val)=>{
                    setForm(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp.items[index].discount = val;
                      return temp;
                    });
                  }}
                />
                <Field
                  title="描述"
                  titleWidth={90}
                  placeholder="请输入描述"
                  value={item.name}
                  onChange={(val)=>{
                    setForm(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp.items[index].name = val;
                      return temp;
                    });
                  }}
                />
              </View>
            </React.Fragment>
          );
        }) : null}
      </ScrollView>
      <BottomBar>
        {!!form.id ? (
          <React.Fragment>
            <Button
              loading={loading}
              style={{ marginRight: addUnit(12) }}
              hairline
              type="primary"
              onClick={deleteClick}
            >
              删除
            </Button>
            {form.status === 1 ? (
              <Button
                hairline
                loading={loading}
                type="warning"
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{ stateClick(2, "禁用");}}
              >
                禁用
              </Button>
            ) : form.status === 2 ? (
              <Button
                loading={loading}
                type="warning"
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{ stateClick(1, "启用");}}
              >
                启用
              </Button>
            ) : null}
          </React.Fragment>
        ) : null}
        <Button
          style={!!form.id ? { flex: 1 } : { width: "70%" }}
          type="info"
          loading={loading}
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default PrepayEdit;
