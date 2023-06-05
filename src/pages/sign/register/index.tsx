// @ts-ignore
import React, { FC, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View, ScrollView } from "@tarojs/components";
import { userApi } from "@/api/user";
import { useDispatch } from "react-redux";
import { setStoreInfo, setUserInfo } from "@/store/actions/user";
import { addUnit } from "@/components/utils";
import Logo from "@/assets/logo.png";
import Field from "@/components/field";
import Button from "@/components/button";
import classnames from "classnames";
import "../login/index.scss";

const Register: FC = () => {

  const [form, setForm] = useState({ user: "", msg_code: "", msg_id: "" });
  const [error, setError] = useState({ user: "", msg_code: "" });
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

  const [sendSms, getSendSms] = useState({
    isGetting: false,
    canSend: true,
    seconds: 60
  });
  const handleGetCaptcha = () => {
    if (!(!sendSms.canSend || (!!form.user && error.user) || !form.user)) {
      userApi.user.sendSMS({ type: 2, mobile: form.user }).then(res => {
        if (res.code === 0) {
          // getSendSms(prev => {
          //   let temp = JSON.parse(JSON.stringify(prev));
          //   temp.canSend = false;
          //   return temp;
          // });
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

  const registerSubmit = () => {
    let vaild = true;
    setError(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp.user = verifyReg(form.user, "phone");
      temp.msg_code = verifyReg(form.msg_code, "sms");
      if (!!temp.user) {
        Taro.showToast({ title: temp.user, icon: "none" });
      } else if (!!temp.msg_code) {
        Taro.showToast({ title: temp.msg_code, icon: "none" });
      }
      vaild = !(!!temp.user || !!temp.msg_code);
      return temp;
    });
    if (vaild) {
      const obj = {
        type: 2,
        user: form.user,
        msg_code: form.msg_code,
        msg_id: form.msg_id
      };
      userApi.user.register(obj).then(res => {
        if (res.code === 0) {
          dispatch(setStoreInfo(""));
          dispatch(setUserInfo({ token: { token: res.data.token, expire: res.data.token_expire }, info: res.data.user }));
          Taro.reLaunch({ url: "/pages/store/list/index" });
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
          <Image className="sign-logo" mode="aspectFill" src={Logo} />
        </View>
        <View className="sign-salong">现在注册，即可免费开店</View>
        <View className="sign-form card">
          <Field
            border={false}
            clearable
            type="tel"
            className="sign-form__field"
            name="user"
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title="手机号码"
            placeholder="请输入手机号码"
            value={form.user}
            onChange={(val) => { handleChange(val, "user"); }}
            // onBlur={() => { handleVerifyForm("user"); }}
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
            // onBlur={() => { handleVerifyForm("msg_code"); }}
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
        </View>
        <View className="sign-action">
          <Button
            type="info"
            size="medium"
            onClick={registerSubmit}
            disabled={(!!error.user || !!error.msg_code) || !form.user || !form.msg_code}
          >
            立即注册
          </Button>
        </View>
        <View className="sign-tips">
          <Text className="sign-tips__text">注册即表示你已阅读并同意 </Text>
          <Text
            className={classnames("sign-tips__text", "sign-tips__text--link")}
            onClick={() => {
              Taro.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/agreement/&title=用户协议` });
            }}
          >
            《用户协议》
          </Text>
          <Text
            className={classnames("sign-tips__text", "sign-tips__text--link")}
            onClick={() => {
              Taro.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/privacy/&title=隐私政策` });
            }}
          >
            《隐私政策》
          </Text>
        </View>
        <View className="sign-action" style={{ marginTop: addUnit(48) }}>
          <Button
            textColor="#666"
            type="text"
            hairline
            onClick={() => {
              Taro.navigateTo({ url: "/pages/sign/login/index" });
            }}
          >
            已有账号？去登录
          </Button>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Register;
