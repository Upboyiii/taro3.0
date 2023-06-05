// @ts-ignore
import React, { FC, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View, ScrollView } from "@tarojs/components";
import { userApi } from "@/api/user";
import { useDispatch } from "react-redux";
import { addUnit } from "@/components/utils";
import Field from "@/components/field";
import Button from "@/components/button";
import classnames from "classnames";
import "../login/index.scss";


const FindPass: FC = () => {

  const [form, setForm] = useState({ user: "", msg_code: "", pass: "", msg_id: "" });
  const [error, setError] = useState({ user: "", msg_code: "", pass: "" });
  // @ts-ignore
  const dispatch = useDispatch();

  const verifyReg = (val, type) => {
    let reg;
    if (type === "phone") {
      reg = /^1[3456789]\d{9}$/;
      if (!reg.test(val)) {
        return "请输入正确的手机号码";
      }
    }
    if (type === "sms") {
      reg = /^\d{6}$/;
      if (!reg.test(val)) {
        return "请输入6位数短信验证码";
      }
    }
    if (type === "pass") {
      reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
      if (!reg.test(val)) {
        return "请输入8-16位数字和字母组合密码";
      }
    }
    return "";
  };

  const verifyForm = (val, mode) => {
    setError(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      let tempType = mode === "user" ? "phone" : mode === "msg_code" ? "sms" : "pass";
      temp[mode] = verifyReg(val, tempType);
      return temp;
    });
  };

  const handleChange = (val, mode) => {
    setForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp[mode] = val;
      return temp;
    });
    verifyForm(val, mode);
  };

  // @ts-ignore
  const handleVerifyForm = type => {
    verifyForm(form[type], type);
  };

  const [sendSms, getSendSms] = useState({
    isGetting: false,
    canSend: true,
    seconds: 60
  });
  const handleGetCaptcha = () => {
    if (!(!sendSms.canSend || (!!form.user && error.user) || !form.user)) {
      userApi.user.sendSMS({ type: 4, mobile: form.user }).then(res => {
        if (res.code === 0) {
          setForm(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp.msg_code = res.data.msg_code;
            temp.msg_id = res.data.msg_id;
            return temp;
          });
          let timer = null;
          // @ts-ignore
          timer = setInterval(() => {
            getSendSms(prev => {
              let temp = JSON.parse(JSON.stringify(prev));
              temp.seconds -= 1;
              temp.canSend = false;
              if (temp.seconds <= 0) {
                if (timer) {
                  clearInterval(timer);
                  timer = null;
                }
                temp.canSend = true;
                temp.seconds = 60;
              }
              return temp;
            });
          }, 1000);
        }
      });
    } else {
      setError(prev => {
        let temp = JSON.parse(JSON.stringify(prev));
        temp["user"] = verifyReg(form.user, "phone");
        return temp;
      });
    }
  };

  const btnSubmit = () => {
    let vaild = true;
    setError(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp.user = verifyReg(form.user, "phone");
      temp.msg_code = verifyReg(form.msg_code, "sms");
      temp.pass = verifyReg(form.pass, "pass");
      if (!!temp.user) {
        Taro.showToast({ title: temp.user, icon: "none" });
      } else if (!!temp.msg_code) {
        Taro.showToast({ title: temp.msg_code, icon: "none" });
      } else if (!!temp.pass) {
        Taro.showToast({ title: temp.pass, icon: "none" });
      }
      vaild = !(!!temp.user || !!temp.msg_code || !!temp.pass);
      return temp;
    });
    if (vaild) {
      const obj = {
        type: 2,
        user: form.user,
        msg_id: form.msg_id,
        msg_code: form.msg_code,
        pass: form.pass
      };
      userApi.user.forgot(obj).then(res => {
        console.log("res", res);
        if (res.code === 0) {
          Taro.showToast({ title: res.message, icon: "success" });
          Taro.reLaunch({ url: "/pages/sign/login/index" });
        } else {
          Taro.showToast({ title: res.message, icon: "error" });
        }
      });
    }
  };

  return (
    <React.Fragment>
      <View className="sign-content">
        <View className="sign-header">
          <Image className="sign-logo" mode="aspectFill" src={require("@/assets/logo.png")} />
        </View>
        <View className="sign-salong">找回密码</View>
        <View className="sign-form card">
          <Field
            border={false}
            type="tel"
            className="sign-form__field"
            name="user"
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title="手机号码"
            placeholder="注册时填写的手机号码"
            value={form.user}
            onChange={(val) => { handleChange(val, "user"); }}
            // onBlur={()=>{handleVerifyForm("user");}}
            error={!!error.user}
            errorIcon={false}
            errorMessage={error.user}
            errorMessagePosition="title"
          />
          <Field
            type="digit"
            maxlength={6}
            className="sign-form__field"
            name="password"
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title="短信验证码"
            placeholder="请输入短信验证码"
            value={form.msg_code}
            onChange={(val) => { handleChange(val, "msg_code"); }}
            // onBlur={()=>{handleVerifyForm("msg_code");}}
            error={!!error.msg_code}
            errorIcon={false}
            errorMessage={error.msg_code}
            errorMessagePosition="title"
            onRight={handleGetCaptcha}
            right={
              <Text style={{ lineHeight: addUnit(24), color: !sendSms.canSend || (!!form.user && error.user) || !form.user ? "#999" : "#0080ff" }}>
                {sendSms.canSend ? "获取验证码" : `${sendSms.seconds}s后重新获取`}
              </Text>
            }
          />
          <Field
            type="password"
            className="sign-form__field"
            name="password"
            maxlength={16}
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title="设置新密码"
            placeholder="8-16位必须包含字母和数字"
            value={form.pass}
            onChange={(val) => { handleChange(val, "pass"); }}
            // onBlur={()=>{handleVerifyForm("pass");}}
            error={!!error.pass}
            errorIcon={false}
            errorMessage={error.pass}
            errorMessagePosition="title"
          />
        </View>
        <View className="sign-action">
          <Button
            type="info"
            size="medium"
            onClick={btnSubmit}
            disabled={(!!error.user || !!error.msg_code || !!error.pass) || !form.user || !form.msg_code || !form.pass}
          >
            确认修改
          </Button>
        </View>
        <View className="sign-action" style={{ marginTop: addUnit(48) }}>
          <Button
            textColor="#666"
            type="text"
            hairline
            onClick={() => {
              Taro.reLaunch({ url: "/pages/sign/login/index" });
            }}
          >
            返回登录
          </Button>
        </View>
      </View>
    </React.Fragment>
  );
};

export default FindPass;
