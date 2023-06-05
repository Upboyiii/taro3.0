import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import Field from "@/components/field";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const TableGroupEdit: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const id: any = getCurrentInstance().router?.params.id;
  const _title = Object.keys(_params).length > 0 ? "修改餐桌分组" : "添加餐桌分组";

  const init = {
    id: 0,
    name: "",
    mark: "",
    desk_nums: null,
    state: 1
  };
  const [form, setForm] = useState(init);
  useEffect(() => {
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || {}));
      setForm(_form);
    }
  }, []);

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
    if (id) {
      let obj = {
        id: _form.id,
        name: _form.name,
        mark: _form.mark,
        state: state,
        store_id: _form.store_id
      };
      // 修改
      pluginApi.plugin("PUT", 312, "saveTags", JSON.stringify(obj), 19848070).then(res => {
        if (res.code === 0) {
          eventCenterTrigger("deskGroup");
          navigateTo({ method:"navigateBack" });
        }
      });
    } else {
      let obj = {
        id: 0,
        name: _form.name,
        mark: _form.mark
      };
      // 新增
      pluginApi.plugin("PUT", 312, "saveTags", JSON.stringify(obj), 19848070).then(res => {
        if (res.code === 0) {
          eventCenterTrigger("deskGroup");
          navigateTo({ method:"navigateBack" });
        }
      });
    }
  };

  const updateStatus = (state) => {
    if (state === -1) {
      Taro.showModal({
        title: "禁用此分组？",
        content: "禁用后，用户编辑餐桌时将无法选择该分组",
        cancelText: "我再想想",
        confirmText: "确定禁用",
        confirmColor: "#ff2340",
        success: function () {
          handleSave1(state);
        }
      });
    } else {
      handleSave1(state);
    }
  };

  const handleSave1 = (state) => {
    let _form = JSON.parse(JSON.stringify(form));
    let obj = {
      id: _form.id,
      state: state
    };
    pluginApi.plugin("PUT", 312, "updateTags", JSON.stringify(obj), 19848070).then(res => {
      if (res.code === 0) {
        Taro.navigateBack({ delta: 1 });
        Taro.eventCenter.trigger("Tags");
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            required
            title="分组名称"
            value={form.name}
            placeholder="请输入餐桌分组名称"
            onChange={(val) => {
              handleChange(val, "name");
            }}
          />
          <Field
            title="分组描述"
            type="textarea"
            value={form.mark}
            placeholder="请输入分组描述"
            onChange={(val) => {
              handleChange(val, "mark");
            }}
          />
        </View>
      </ScrollView>
      <BottomBar>
        {Object.keys(_params).length > 0 ? (
          <React.Fragment>
            {form.state === -1 ? (
              <Button
                style={{ marginRight: addUnit(12) }}
                type="primary"
                onClick={() => {
                  updateStatus(1);
                }}
              >
                启用
              </Button>
            ) : form.state === 1 && !form.desk_nums ? (
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
    </View>
  );
};

export default TableGroupEdit;
