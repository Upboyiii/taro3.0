// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { settingApi } from "@/api/co_admin";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import store from "@/store";
import Field from "@/components/field";
import Button from "@/components/button";
import Checkbox from "@/components/checkbox";
import Popup from "@/components/popup";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const StaffEdit: FC = () => {
  const id = Number(getCurrentInstance().router?.params.id);
  const { store_id } = store.getState().storeInfo;
  const title = id ? "修改员工" : "新增员工";

  const init = {
    id: 0,
    name: "",
    phone: "",
    staff_no: "",
    store_group: [
      {
        group: [] as any,
        staff_id: 0,
        store_id: store_id
      }
    ],
    state: 1
  };
  const [form, setForm] = useState(init);
  const [formErr, setFormErr] = useState({
    phone: "",
    name: "",
    role: ""
  });
  const getInfo = (id) => {
    settingApi.staff
      .get({ id })
      .then(resp => {
        if (resp.code === 0) {
          const roles = resp?.data?.store_group || [{
            group: [] as any,
            staff_id: 0,
            store_id: store_id
          }];
          let rolesIDs = [];
          if((roles[0]?.group || []).length > 0){
            rolesIDs = (roles[0]?.group || []).map(role => role.role_id);
            setRoleChecked(rolesIDs);
          }
          let _form = Object.assign({}, init, resp?.data);
          _form.store_group = roles;
          setForm(_form);
        }
      });
  };
  useEffect(() => {
    Taro.setNavigationBarTitle({ title });
    getRoleList(1);
    if (id) {
      getInfo(id);
    }
  }, []);

  const [roleLabel, setRoleLabel] = useState("");
  const [roleShow, setRoleShow] = useState(false);
  const [roleChecked, setRoleChecked] = useState<any[]>([]);
  const [roleList, setRoleList] = useState<any[]>([]);
  const getRoleList = (type) => {
    if (roleList.length === 0) {
      settingApi.role
        .page({
          type: type || 1,
          page: 1,
          page_size: 9999
        })
        .then(resp => {
          if (resp.code === 0) {
            setRoleList(resp?.data?.list || []);
          }
        });
    }
  };

  useEffect(() => {
    const checkedRoles = roleList
      .filter(role => roleChecked.indexOf(role.id) > -1)
      .map(role => role.name)
      .join("; ");
    setRoleLabel(checkedRoles);
  }, [roleChecked, roleList]);

  const handleChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
    verifyForm(false, val, ref);
  };

  const verifyForm = (callback = false, val = "", ref = "") => {
    let verify = true;
    setFormErr(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let err = {
        phone: "请输入员工手机号码",
        name: "请输入员工姓名",
        role: "请选择员工角色"
      };
      if(!!ref){
        if(ref === "role"){
          temp.role = roleChecked.length === 0 ? err.role : "";
        }else{
          temp[ref] = !val ? err[ref] : "";
        }
      }else{
        const phoneReg = /^1[3456789]\d{9}$/;
        if(!phoneReg.test(form.phone)){
          temp.phone = "请输入正确的手机号码";
        }else{
          temp.phone = "";
        }
        temp.name = form.name === "" ? err.name : "";
        temp.role = roleChecked.length === 0 ? err.role : "";
        verify = !(!!temp.phone || !!temp.name || !!temp.role);
      }
      return temp;
    });
    if(callback){
      return verify;
    }
  };

  const saveStaff = () => {
    const verify = verifyForm(true);
    if(!verify) return;
    form.store_group[0].group = roleList.filter((item) => roleChecked.indexOf(item.id) > -1).map((item) => {
      return {
        role_id: item.id,
        role_type: item.role_type
      };
    });
    const action = !!id ? "edit" : "add";
    settingApi.staff[action](form)
      .then(resp => {
        if (resp.code === 0) {
          eventCenterTrigger("staffEdit");
          navigateTo({ method:"navigateBack" });
        }else{
          Taro.showToast({ title: resp.message, icon: "none" });
        }
      });
  };

  const deleteStaff = () => {
    Taro.showModal({
      title: "提示",
      content: "确定要删除此员工？",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          settingApi.staff.delete({ id }).then(res => {
            if (res.code === 0) {
              eventCenterTrigger("staffEdit");
              navigateTo({ method:"navigateBack" });
            }
          });
        }
      }
    });
  };

  const inviteClick = () => {
    settingApi.staff
      .invite({ id })
      .then(resp => {
        if (resp.code === 0) {
          Taro.eventCenter.trigger("refresh_staff");
          Taro.navigateBack({ delta: 1 });
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
            type="tel"
            title="手机号码"
            placeholder="请输入员工手机号码"
            value={form.phone}
            error={!!formErr.phone}
            errorMessage={formErr.phone}
            onChange={(val) => { handleChange(val, "phone"); }}
          />
        </View>
        <View className="card-tips">员工使用该手机号码作为帐号即可登录彩豚后台</View>
        <View className="card">
          <Field
            required
            border={false}
            title="员工姓名"
            placeholder="请输入员工姓名"
            value={form.name}
            error={!!formErr.name}
            errorMessage={formErr.name}
            onChange={(val) => { handleChange(val, "name"); }}
          />
          <Field
            title="员工编号"
            placeholder="请输入员工编号"
            value={form.staff_no}
            onChange={(val) => { handleChange(val, "staff_no"); }}
          />
        </View>
        <View className="card">
          <Field
            required
            border={false}
            title="员工角色"
            input={false}
            placeholder="请选择员工角色"
            value={roleLabel}
            onClick={() => {
              setRoleShow(true);
            }}
            clickable
            arrow
            error={!!formErr.role}
            errorMessage={formErr.role}
          />
        </View>
      </ScrollView>
      <BottomBar>
        {!!id && form.state === 3 ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            type="success"
            onClick={inviteClick}
          >
            重新邀请
          </Button>
        ) : null}
        {!!id ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            hairline
            type="primary"
            onClick={deleteStaff}
          >
            删除
          </Button>
        ) : null}
        <Button
          style={{ width: !!id && form.state === 3 ? "40%" : "70%" }}
          type="info"
          onClick={saveStaff}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        position="pageSheet"
        bgColor="#f7f8f8"
        title="选择员工角色"
        show={roleShow}
        onClose={() => { setRoleShow(false); }}
        action={
          <Button
            type="info"
            style={{ width: "70%" }}
            disabled={roleChecked.length === 0}
            onClick={() => {
              setRoleShow(false);
              verifyForm(false, "", "role");
            }}
          >
            确定
          </Button>
        }
      >
        {roleList.length > 0 ? (
          <View className="card" style={{ marginTop: addUnit(12) }}>
            {roleList.map((item, index) => {
              return (
                <Checkbox
                  key={`freight-${index}`}
                  cell
                  border={index !== 0}
                  checked={roleChecked.indexOf(item.id) > -1}
                  label={item.name}
                  labelStyle={{ fontSize: addUnit(16) }}
                  style={{ paddingTop: addUnit(16), paddingBottom: addUnit(16) }}
                  onChange={(val) => {
                    setRoleChecked(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      console.log(temp,"temp");
                      if(val){
                        if(temp.indexOf(item.id) === -1){
                          temp.push(item.id);
                        }
                      } else{
                        if(temp.indexOf(item.id) > -1){
                          temp.splice(temp.indexOf(item.id),1);
                        }
                      }
                      return temp;
                    });
                  }}
                />
              );
            })}
          </View>
        ) : (
          <Empty desc="暂无员工角色" />
        )}
      </Popup>
    </View>
  );
};

export default StaffEdit;
