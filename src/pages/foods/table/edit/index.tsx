import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Field from "@/components/field";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Radio from "@/components/radio";
import Popup from "@/components/popup";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FoodsTableEdit: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const _title = Object.keys(_params).length > 0 ? "修改餐桌" : "添加餐桌";
  const id: any = getCurrentInstance().router?.params.id;

  const init = {
    id: 0,
    name: "",
    mark: "",
    tags_id: -1,
    state: 1,
    nums: ""
  };
  const [form, setForm] = useState(init);
  useEffect(() => {
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || {}));
      setForm(_form);
    }
    getGroupList();
  }, []);

  const ungrouped = [{ name: "不分组", id: 0, mark: "餐桌少，不需要分组" }];
  const [loading, setLoading] = useState(false);
  const [groupShow, setGroupShow] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupList, setGroupList] = useState<any[]>(ungrouped);
  const getGroupList = () => {
    if (groupList.length === 1 || groupList.length === 0) {
      setLoading(true);
      pluginApi.plugin("GET", 312, "getTags", JSON.stringify({}), 19848070)
        .then(res => {
          if (res.code === 0 && !!res?.data && res?.data.length > 0) {
            setGroupList([...ungrouped, ...(res?.data || [])]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    for (let i = 0; i < groupList.length; i++) {
      if (form.tags_id === groupList[i].id) {
        setGroupName(groupList[i].name);
        break;
      }
    }
  }, [form.tags_id, groupList]);

  const handleChange = (val, type) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[type] = val;
      return temp;
    });
  };

  const handleSave = (state = 1) => {
    let _form = JSON.parse(JSON.stringify(form));
    _form.state = state;
    let obj = {
      id: id ? Number(id) : 0,
      name: _form.name,
      mark: _form.mark,
      state: state,
      tags_id: _form.tags_id ? _form.tags_id : 0
    };

    let obj1 = {
      id: id ? Number(id) : 0,
      name: _form.name,
      mark: _form.mark,
      state: state,
      tags_id: _form.tags_id ? _form.tags_id : 0,
      store_id: _form.store_id,
      coid: _form.coid
    };
    // 修改
    pluginApi.plugin("PUT", 312, "saveDesk", JSON.stringify(id ? obj1 : obj), 19848070).then(res => {
      if (res.code === 0) {
        eventCenterTrigger("foodsTable");
        navigateTo({ method:"navigateBack" });
      }
    });
  };

  const updateStatus = (state) => {
    if (state === -1) {
      Taro.showModal({
        title: "禁用此餐桌？",
        content: "禁用后，客户在线点餐将无法选择该餐桌",
        cancelText: "我再想想",
        confirmText: "确定禁用",
        confirmColor: "#ff2340",
        success: function () {
          handleSave(state);
        }
      });
    } else {
      handleSave(state);
    }
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            required
            border={false}
            title="所属分组"
            input={false}
            value={groupName}
            placeholder="请选择所属分组"
            arrow
            clickable
            onClick={() => { setGroupShow(true); }}
          />
          <Field
            required
            title="餐桌桌号"
            value={form.name}
            placeholder="请输入餐桌桌号"
            onChange={(val) => {
              handleChange(val, "name");
            }}
          />
          <Field
            required
            title="可坐人数"
            type="digit"
            value={form.nums}
            placeholder="请输入餐桌桌号"
            right="人"
            onChange={(val) => {
              handleChange(val, "nums");
            }}
          />
          <Field
            title="餐桌描述"
            type="textarea"
            value={form.mark}
            placeholder="请输入商品描述"
            onChange={(val) => {
              handleChange(val, "mark");
            }}
          />
        </View>
      </ScrollView>
      <BottomBar>
        {Object.keys(_params).length > 0 ? (
          <React.Fragment>
            {form.state === 1 ? (
              <Button
                style={{ marginRight: addUnit(12) }}
                hairline
                type="primary"
                onClick={() => {
                  updateStatus(-1);
                }}
              >
                禁用
              </Button>
            ) : form.state === -1 ? (
              <Button
                style={{ marginRight: addUnit(12) }}
                type="primary"
                onClick={() => {
                  updateStatus(1);
                }}
              >
                启用
              </Button>
            ) : null}
          </React.Fragment>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            handleSave();
          }}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        show={groupShow}
        title="选择餐桌分组"
        position="pageSheet"
        bgColor="#f7f8f8"
        onClose={() => { setGroupShow(false); }}
        action={
          <Button
            type="info"
            style={{ width: "70%" }}
            onClick={() => {
              setGroupShow(false);
              Taro.navigateTo({ url: "/pages/foods/group/index" });
            }}
          >
            分组管理
          </Button>
        }
      >
        {loading ? (
          <React.Fragment>
            {Array(8)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {groupList.length > 0 ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {groupList.map((item, index) => {
                  if (item.state === -1) return null;
                  return (
                    <React.Fragment key={`group-${index}`}>
                      <Radio
                        border={index !== 0}
                        cell
                        labelPosition="right"
                        label={item.name}
                        desc={item.mark}
                        checked={form.tags_id === item.id}
                        onClick={() => {
                          handleChange(item.id, "tags_id");
                          setGroupShow(false);
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </View>
            ) : (
              <Empty title="暂无相关餐桌分组" desc="快去创建吧">
                <Button
                  type="info"
                  plain
                  onClick={() => {
                    setGroupShow(false);
                    Taro.navigateTo({ url: "/pages/foods/group/edit/index" });
                  }}
                >
                  添加餐桌分组
                </Button>
              </Empty>
            )}
          </React.Fragment>
        )}
      </Popup>
    </View>
  );
};

export default FoodsTableEdit;
