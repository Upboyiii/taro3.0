import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { shopApi } from "@/api/co_admin";
import { formatPrice, getTimeStamp, secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GrouponEdit: FC = () => {

  const _id = getCurrentInstance().router?.params?.id;
  const _title = !!_id ? "修改拼团活动" : "创建拼团活动";

  const now = new Date().getTime();
  const init = {
    id: 0,
    name: "",
    type: 1, // 1：普通拼团，2：老带新拼团，3：阶梯拼团
    start_at: secToDate(now), // 开始时间
    end_at: secToDate(now + 86400 * 1000), // 开始时间
    shop_id: null, // 商品
    nums: "", // 参团人数-第一阶梯人数
    price: "", // 参团价格-第一阶梯价格
    nums2: "", // 参团人数-第二阶梯人数
    price2: "", // 参团价格-第二阶梯价格
    nums3: "", // 参团人数-第三阶梯人数
    price3: "", // 参团价格-第三阶梯价格
    expiry: "", // 有效期 分钟,
    expiry_unit: 1,
    rules: -1, // -1不限购 1活动总限购 2每单限购  3两种都限购
    total_limit: "",
    single_limit: "",
    discount: -1, // -1:不叠加其他营销活动,1:优惠券,2:积分抵现,3:两种都叠加
    huddle: -1, // 凑团 1开启
    simulate: -1, // -1:不开启,1:所有未拼成的团,2:参团人数≥的团
    simulate_nums: "",
    collect: -1, // 团长代收 -1:不开启,1:团员可选是否代收,2:团员订单必须由团长代收
    free: -1, // 团长优惠 -1:不开启,1:团长享受优惠价
    free_price: "", // 团长优惠价
    pur_post: -1, // 购买包邮 -1:不开启,1:开启
    state: 0
  };
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);

  const getDetail = (id) => {
    setLoading(true);
    pluginApi.plugin("POST", 322, "getCollageInfo", JSON.stringify({ id }))
      .then(res => {
        if (!!res && res.code === 0) {
          const data = res?.data || {};
          console.log(data,"data");

          data.start_at = secToDate(data.start_at);
          data.end_at = secToDate(data.end_at);
          if (data.type !== 3) {
            data.price = formatPrice(data?.price | 0);
          } else {
            data.price = formatPrice(data?.price | 0);
            data.price2 = formatPrice(data?.price2 | 0);
            data.price3 = formatPrice(data?.price3 | 0);
          }

          if (data.free > 0) {
            data.free_price = formatPrice(data?.free_price | 0);
          }
          if (data.expiry > 60) {
            if (data.expiry / 60 > 24) {
              data.expiry_unit = 3;
              data.expiry = data.expiry / 60 / 24;
            } else {
              data.expiry_unit = 2;
              data.expiry = data.expiry / 60;
            }
          } else {
            data.expiry_unit = 1;
          }

          setForm(Object.assign({}, init, data));
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!!_id) {
      Taro.setNavigationBarTitle({ title: _title });
      getDetail(parseInt(_id));
    }
  }, []);

  useEffect(() => {
    eventCenterOn("grouponSelect", (res) => {
      if(!!res[0]){
        if(!!res[0]?.type){
          if(res[0]?.type === "goods"){
            handleValueChange(res[0]?.ids,"shop_id");
          }
          if(res[0]?.type === "store"){
            handleValueChange(res[0]?.ids,"store");
          }
        }
      }
      // console.log(res[0],"res");
    });

    return () => {
      eventCenterOff("couponSelect");
    };
  }, []);

  const [goodsLabel, setGoodsLabel] = useState("");
  const getGoodsLabel = (id) => {
    shopApi.goods.get({ id }).then(res=>{
      if(!!res && res.code === 0) {
        setGoodsLabel(res?.data?.name);
      }
    });
  };
  useEffect(() => {
    if(!!form.shop_id){
      getGoodsLabel(form.shop_id);
    }
  }, [form.shop_id]);

  const handleValueChange = (val, ref, father = "") => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!_form.name) {
      Taro.showToast({ title: "请输入拼团活动名称", icon: "none" });
      return;
    }
    if (!_form.start_at) {
      Taro.showToast({ title: "请选择拼团开始日期", icon: "none" });
      return false;
    }
    if (!_form.end_at) {
      Taro.showToast({ title: "请选择拼团结束日期", icon: "none" });
      return false;
    }
    if (getTimeStamp(_form.start_at) >= getTimeStamp(_form.end_at)) {
      Taro.showToast({ title: "拼团结束日期必须大于开团日期", icon: "none" });
      return false;
    }
    if (!_form.shop_id) {
      Taro.showToast({ title: "请选择要参加拼团的商品", icon: "none" });
      return false;
    }
    if (_form.type !== 3) {
      if (!_form.nums) {
        Taro.showToast({ title: "请输入拼团人数", icon: "none" });
        return false;
      }else{
        _form.nums = parseInt(_form.nums);
      }
      if (!_form.price) {
        Taro.showToast({ title: "请输入拼团价格", icon: "none" });
        return false;
      }else{
        _form.price = parseFloat(_form.price) * 100;
      }
      delete _form.nums2;
      delete _form.price2;
      delete _form.nums3;
      delete _form.price3;
    }else{
      if (!_form.nums) {
        Taro.showToast({ title: "请输入一阶梯人数", icon: "none" });
        return false;
      }else{
        _form.nums = parseInt(_form.nums);
      }
      if (!_form.price) {
        Taro.showToast({ title: "请输入一阶梯价格", icon: "none" });
        return false;
      }else{
        _form.price = parseFloat(_form.price) * 100;
      }
      if (!_form.nums2) {
        Taro.showToast({ title: "请输入二阶梯人数", icon: "none" });
        return false;
      }else{
        _form.nums2 = parseInt(_form.nums2);
      }
      if (!_form.price2) {
        Taro.showToast({ title: "请输入二阶梯价格", icon: "none" });
        return false;
      }else{
        _form.price2 = parseFloat(_form.price2) * 100;
      }
      if (!_form.nums3) {
        Taro.showToast({ title: "请输入三阶梯人数", icon: "none" });
        return false;
      }else{
        _form.nums3 = parseInt(_form.nums3);
      }
      if (!_form.price3) {
        Taro.showToast({ title: "请输入三阶梯价格", icon: "none" });
        return false;
      }else{
        _form.price3 = parseFloat(_form.price3) * 100;
      }
    }
    if(!_form.expiry){
      Taro.showToast({ title: "请输入拼团有效期", icon: "none" });
      return false;
    }else{
      _form.expiry = parseInt(_form.expiry);
      if (_form.expiry_unit > 1) {
        _form.expiry = _form.expiry_unit === 2 ? _form.expiry * 60 : _form.expiry * 60 * 24;
      }
      delete _form.expiry_unit;
    }
    if(_form.rules === -1){
      delete _form.total_limit;
      delete _form.single_limit;
    }
    if(_form.rules === 1 || _form.rules === 3){
      if (!_form.total_limit) {
        Taro.showToast({ title: "请输入总限购数量", icon: "none" });
        return false;
      }else{
        _form.total_limit = parseInt(_form.total_limit);
      }
      if(_form.rules === 1){
        delete _form.single_limit;
      }
    }
    if(_form.rules === 2 || _form.rules === 3){
      if (!_form.single_limit) {
        Taro.showToast({ title: "请输入每单限购数量", icon: "none" });
        return false;
      }else{
        _form.single_limit = parseInt(_form.single_limit);
      }
      if(_form.rules === 2){
        delete _form.total_limit;
      }
    }

    if(_form.simulate === 2){
      if (!_form.simulate_nums) {
        Taro.showToast({ title: "请输入参团大于的人数", icon: "none" });
        return false;
      }else{
        _form.simulate_nums = parseInt(_form.simulate_nums);
      }
    }else{
      delete _form.simulate_nums;
    }
    if(_form.free === 1){
      if (!_form.free_price) {
        Taro.showToast({ title: "请输入团长优惠价", icon: "none" });
        return false;
      }else{
        _form.free_price = Number(_form.free_price) * 100;
      }
    }else{
      delete _form.free_price;
    }

    // console.log(_form,"_form");

    setLoading(true);
    pluginApi .plugin("PUT", 322,"saveCollage",JSON.stringify(_form))
      .then((res) => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("grouponEdit" );
          navigateTo({ method: "navigateBack" });
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

  const stateClick = (plugin_label, method) => {
    const content = plugin_label === "invalidCollage" ? "确将此活动设为失效吗？" : "确定删除此活动吗？";
    const message = plugin_label === "invalidCollage" ? "设为失效失败" : "删除失败";
    Taro.showModal({
      title: "提示",
      content: content,
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi .plugin(method, 322,plugin_label, JSON.stringify({ id: form.id }))
            .then((res) => {
              // console.log(res,"res");
              if (!!res && res.code === 0) {
                eventCenterTrigger("grouponEdit" );
                navigateTo({ method: "navigateBack" });
              }else{
                Taro.showToast({ title: res?.message || message, icon: "error" });
              }
            })
            .catch(res=>{
              Taro.showToast({ title: res?.message || message, icon: "error" });
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
        <View className="card-title">基本信息</View>
        <View className="card">
          <Field
            border={false}
            title="拼团类型"
            titleWidth={90}
            input={false}
            value={["普通拼团", "老带新拼团", "阶梯拼团"][form.type - 1]}
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["普通拼团", "老带新拼团", "阶梯拼团"],
                success: function (res) {
                  const index = res.tapIndex;
                  handleValueChange(index + 1, "type");
                }
              });
            }}
          />
          <Field
            required
            title="拼团名称"
            titleWidth={90}
            value={form.name}
            placeholder="请输入拼团活动名称"
            onChange={(val) => {
              handleValueChange(val, "name");
            }}
          />
          <Picker
            mode="date"
            value={form.start_at}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const time = e.detail.value.replace(/\//g, "-");
              handleValueChange(time + " 00:00:00","start_at");
            }}
          >
            <Cell
              titleStyle={{ width: addUnit(90) }}
              title="开团日期"
              contentAlign="left"
              contentStyle={!form.start_at ? { color: "#ccc" } : {}}
              content={!!form.start_at ? form.start_at : "请选择开团日期"}
              arrow
            />
          </Picker>
          <Picker
            mode="date"
            value={form.end_at}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
            onChange={(e)=>{
              const time = e.detail.value.replace(/\//g, "-");
              handleValueChange(time + " 00:00:00","end_at");
            }}
          >
            <Cell
              titleStyle={{ width: addUnit(90) }}
              title="结束日期"
              contentAlign="left"
              contentStyle={!form.end_at ? { color: "#ccc" } : {}}
              content={!!form.end_at ? form.end_at : "请选择结束日期"}
              arrow
            />
          </Picker>
          <Field
            required
            title="拼团商品"
            titleWidth={90}
            input={false}
            value={!!form.shop_id ? goodsLabel ? goodsLabel : "已选择" : ""}
            placeholder="请选择要参加拼团活动的商品"
            arrow
            clickable
            onClick={() => {
              navigateTo({ url: "/pages/com/goods-select/index", method: "navigateTo", params: { ids: form.shop_id, refs: "grouponSelect", mode: "goods", sys: -1 } });
            }}
          />
        </View>
        <View className="card-title">拼团人数/价格</View>
        <View className="card">
          {form.type !== 3 ? (
            <React.Fragment>
              <Field
                required
                border={false}
                title="拼团人数"
                titleWidth={90}
                type="digit"
                value={form.nums}
                placeholder="填写拼团人数"
                right="人"
                onChange={(val) => {
                  handleValueChange(val, "nums");
                }}
              />
              <Field
                required
                title="拼团价格"
                titleWidth={90}
                type="number"
                value={form.price}
                placeholder="填写拼团价格"
                right="元"
                onChange={(val) => {
                  handleValueChange(val, "price");
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Field
                required
                border={false}
                title="一阶梯人数"
                titleWidth={90}
                type="digit"
                value={form.nums}
                placeholder="填写一阶梯人数"
                right="人"
                onChange={(val) => {
                  handleValueChange(val, "nums");
                }}
              />
              <Field
                required
                title="一阶梯价格"
                titleWidth={90}
                type="number"
                value={form.price}
                placeholder="填写一阶梯价格"
                right="元"
                onChange={(val) => {
                  handleValueChange(val, "price");
                }}
              />
              <Field
                required
                title="二阶梯人数"
                titleWidth={90}
                type="digit"
                value={form.nums2}
                placeholder="填写二阶梯人数"
                right="人"
                onChange={(val) => {
                  handleValueChange(val, "nums2");
                }}
              />
              <Field
                required
                title="二阶梯价格"
                titleWidth={90}
                type="number"
                value={form.price2}
                placeholder="填写二阶梯价格"
                right="元"
                onChange={(val) => {
                  handleValueChange(val, "price2");
                }}
              />
              <Field
                required
                title="三阶梯人数"
                titleWidth={90}
                type="digit"
                value={form.nums3}
                placeholder="填写三阶梯人数"
                right="人"
                onChange={(val) => {
                  handleValueChange(val, "nums3");
                }}
              />
              <Field
                required
                title="三阶梯价格"
                titleWidth={90}
                type="number"
                value={form.price3}
                placeholder="填写三阶梯价格"
                right="元"
                onChange={(val) => {
                  handleValueChange(val, "price3");
                }}
              />
            </React.Fragment>
          )}
          <Field
            required
            title="拼团有效期"
            titleWidth={90}
            type="digit"
            value={form.expiry}
            placeholder="填写拼团有效期"
            right={["分", "时", "天"][form.expiry_unit - 1]}
            onChange={(val) => {
              handleValueChange(val, "expiry");
            }}
          />
          <Field
            required
            title="有效期单位"
            titleWidth={90}
            input={false}
            value={["分钟", "小时", "天数"][form.expiry_unit - 1]}
            placeholder="请选择有效期单位"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["分钟", "小时", "天数"],
                success: function (res) {
                  const index = res.tapIndex;
                  handleValueChange(index + 1, "expiry_unit");
                }
              });
            }}
          />
        </View>
        <View className="card-title">拼团规则</View>
        <View className="card">
          <Field
            border={false}
            title="限购规则"
            titleWidth={90}
            input={false}
            value={["不限购","活动总限购","每单限购","两种都限购"][form.rules === - 1 ? 0 : form.rules]}
            placeholder="请选择限购规则"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不限购","活动总限购","每单限购","两种都限购"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "rules");
                }
              });
            }}
          />
          {form.rules === 1 || form.rules === 3 ? (
            <Field
              required
              title="总限购"
              titleWidth={90}
              type="digit"
              value={form.total_limit}
              placeholder="填写总限购数量"
              right="件"
              onChange={(val) => {
                handleValueChange(val, "total_limit");
              }}
            />
          ) : null}
          {form.rules === 2 || form.rules === 3 ? (
            <Field
              required
              title="每单限购"
              titleWidth={90}
              type="digit"
              value={form.single_limit}
              placeholder="填写每单限购量"
              right="件"
              onChange={(val) => {
                handleValueChange(val, "single_limit");
              }}
            />
          ) : null}
          <Field
            title="优惠叠加"
            titleWidth={90}
            input={false}
            value={["不叠加其他营销活动","优惠券","积分抵现","两种都叠加"][form.discount === - 1 ? 0 : form.discount]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不叠加其他营销活动","优惠券","积分抵现","两种都叠加"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "discount");
                }
              });
            }}
          />
          <Field
            title="凑团"
            titleWidth={90}
            input={false}
            value={["不开启","开启"][form.huddle === - 1 ? 0 : form.huddle]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不开启","开启"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "huddle");
                }
              });
            }}
          />
        </View>
        <View className="card-tips">
          开启凑团后，活动商品详情页展示未成团的团列表，买家可以任选一个团参团，提升成团率。
        </View>
        <View className="card">
          <Field
            border={false}
            title="模拟成团"
            titleWidth={90}
            input={false}
            value={["不开启","所有未拼成的团","参团人数大于设定值"][form.simulate === - 1 ? 0 : form.simulate]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不开启","所有未拼成的团","参团人数大于设定值"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "simulate");
                }
              });
            }}
          />
          {form.simulate === 2 ? (
            <Field
              required
              title="参团人数大于"
              titleWidth={90}
              type="digit"
              value={form.simulate_nums}
              placeholder="填写人数"
              right="人"
              onChange={(val) => {
                handleValueChange(val, "simulate_nums");
              }}
            />
          ) : null}
        </View>
        <View className="card-tips">
          开启模拟成团后，满足条件的团，系统将会模拟“匿名买家”凑满该团，仅需对真实拼团买家发货。建议合理开启，以提高成团率。
        </View>
        <View className="card">
          <Field
            border={false}
            title="拼团包邮"
            titleWidth={90}
            input={false}
            value={["不开启","开启"][form.pur_post === - 1 ? 0 : form.pur_post]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不开启","开启"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "pur_post");
                }
              });
            }}
          />
          <Field
            title="团长优惠"
            titleWidth={90}
            input={false}
            value={["不开启","团长享受优惠价"][form.free === - 1 ? 0 : form.free]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不开启","团长享受优惠价"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "free");
                }
              });
            }}
          />
          {form.free === 1 ? (
            <Field
              required
              title="团长优惠价"
              titleWidth={90}
              type="number"
              value={form.free_price}
              placeholder="填写人团长优惠价"
              right="元"
              onChange={(val) => {
                handleValueChange(val, "free_price");
              }}
            />
          ) : null}
          <Field
            title="团长代收"
            titleWidth={90}
            input={false}
            value={["不开启","团员可选是否代收","团员订单必须由团长代收"][form.collect === - 1 ? 0 : form.collect]}
            placeholder="请选择"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不开启","团员可选是否代收","团员订单必须由团长代收"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "collect");
                }
              });
            }}
          />
        </View>
        <View className="card-tips">
          开启团长代收后，代收的订单将发货给团长。适用于收货地址相同的买家拼团，如:公司。团员可以免付邮费，商家也可以少发包事节省成本。虚拟商品不支持代收。
        </View>
      </ScrollView>
      <BottomBar>
        {!!form.id ? (
          <React.Fragment>
            {form.state !== 9 ? (
              <Button
                style={{ marginRight: addUnit(12) }}
                hairline
                type="warning"
                loading={loading}
                onClick={()=>{
                  stateClick("invalidCollage", "PUT");
                }}
              >
                立即失效
              </Button>
            ) : (
              <Button
                style={{ marginRight: addUnit(12) }}
                hairline
                type="primary"
                loading={loading}
                onClick={()=>{
                  stateClick("delCollageInfo", "DELETE");
                }}
              >
                删除
              </Button>
            )}
          </React.Fragment>
        ) : null}
        <Button
          style={form.state !== 9 ? { flex: 1 } : { width: "70%" }}
          type="info"
          loading={loading}
          onClick={()=>{
            saveClick();
          }}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default GrouponEdit;
