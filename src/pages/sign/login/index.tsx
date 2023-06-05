// @ts-ignore
import React, { FC, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View, ScrollView } from "@tarojs/components";
import { userApi } from "@/api/user";
import { useDispatch } from "react-redux";
import { setStoreInfo, setUserInfo } from "@/store/actions/user";
import { addUnit } from "@/components/utils";
import { navigateTo } from "@/utils/library";
import Field from "@/components/field";
import Button from "@/components/button";
import classnames from "classnames";
import "./index.scss";

const Login: FC = () => {
  const [type, setType] = useState(1);
  const [form, setForm] = useState({ user: "", pass: "" ,msg_id:"" });
  const [error, setError] = useState({ user: "", pass: "" });
  const dispatch = useDispatch();
  const verifyReg = (val, type) => {
    let reg;
    if (type === "phone") {
      reg = /^1[3456789]\d{9}$/;
      if(!reg.test(val)){
        return "请输入正确的手机号码";
      }
    }
    if (type === "sms") {
      reg = /^\d{6}$/;
      if(!reg.test(val)){
        return "请输入6位数短信验证码";
      }
    }
    return "";
  };

  const verifyForm = (val, mode) => {
    if(type === 2){
      setError(prev => {
        let temp = JSON.parse(JSON.stringify(prev));
        let tempType = mode === "user" ? "phone" : mode === "pass" ? "sms" : "";
        temp[mode] = verifyReg(val, tempType);
        return temp;
      });
    }
  };

  const handleChange = (val, mode) => {
    setForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp[mode] = val;
      return temp;
    });
    verifyForm(val,mode);
  };

  const handleVerifyForm = type => {
    verifyForm(form[type],type);
  };

  const [sendSms, setSendSms] = useState( {
    isGetting: false,
    canSend: true,
    seconds: 60
  });
  const handleGetCaptcha = () => {
    if(type === 2){
      if(!(!sendSms.canSend || (!!form.user && error.user) || !form.user)){
        userApi.user.sendSMS({ type:2 ,mobile:form.user }).then(res=>{
          console.log(res,"res");
          if(res.code === 0){
            setForm(prev=>{
              let temp = JSON.parse(JSON.stringify(prev));
              temp.msg_id = res.data.msg_id;
              return temp;
            });
            let timer = null;
            // @ts-ignore
            timer = setInterval(() => {
              setSendSms(prev => {
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
      }else {
        setError(prev => {
          let temp = JSON.parse(JSON.stringify(prev));
          temp["user"] = verifyReg(form.user, "phone");
          return temp;
        });
      }
    }else{
      Taro.navigateTo({ url: "/pages/sign/findpass/index" });
    }
  };

  const loginType = type => {
    setForm({ user: "", pass: "" ,msg_id:"" });
    setError({ user: "", pass: "" });
    setType(type);
  };

  const loginSubmit = async () => {
    let vaild = true;
    setError(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp.user = !form.user;
      temp.pass = !form.pass;
      if(type === 2){
        temp.user = verifyReg(form.user, "phone");
        temp.pass = verifyReg(form.pass, "sms");
        if(!!temp.user){
          Taro.showToast({ title: temp.user, icon: "none" });
        }else if(!!temp.pass){
          Taro.showToast({ title: temp.pass, icon: "none" });
        }
      }
      vaild = !(!!temp.user || !!temp.pass);
      return temp;
    });
    if(vaild){
      let userObj = {
        type,
        user:form.user,
        pass:form.pass,
        msg_code:"",
        msg_id: ""
      };
      if(type === 2){
        userObj.msg_code = userObj.pass;
        // @ts-ignore
        delete userObj.pass;
        userObj.msg_id = form.msg_id;
      }
      userApi.user.login(userObj).then(res=>{
        if(res.code === 0){
          dispatch(setStoreInfo(""));
          dispatch(setUserInfo({ token:{ token:res.data.token ,expire:res.data.token_expire },info:res.data.user }));
          Taro.reLaunch({ url:"/pages/store/list/index" });
        }else {
          Taro.showToast({ title:res.message,icon:"error" });
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
        <View className="sign-tabs">
          <View
            className={classnames("sign-tabs__item", { "sign-tabs__item--active": type === 1 })}
            onClick={() => { loginType(1); }}
          >
            密码登录
          </View>
          <View
            className={classnames("sign-tabs__item", { "sign-tabs__item--active": type === 2 })}
            onClick={() => { loginType(2); }}
          >
            验证码登录
          </View>
        </View>
        <View className="sign-form card">
          <Field
            border={false}
            clearable
            type={type === 1 ? "text" : "tel"}
            className="sign-form__field"
            name="user"
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title={type === 1 ? "用户名/邮箱/手机号码" : "手机号码"}
            placeholder={type === 1 ? "用户名/邮箱/手机号码" : "手机号码"}
            value={form.user}
            onChange={(val)=>{handleChange(val,"user");}}
            onBlur={()=>{handleVerifyForm("user");}}
            error={!!error.user}
            errorIcon={false}
            errorMessage={error.user}
            errorMessagePosition="title"
          />
          <Field
            type={type === 1 ? "password" : "digit"}
            maxlength={type === 1 ? 99 : 6}
            className="sign-form__field"
            name="password"
            titleStyle={{ fontWeight: "bold" }}
            titleRow
            title={type === 1 ? "登录密码" : "短信验证码"}
            placeholder={type === 1 ? "请输入密码" : "请输入短信验证码"}
            value={form.pass}
            onChange={(val)=>{handleChange(val,"pass");}}
            onBlur={()=>{handleVerifyForm("pass");}}
            error={!!error.pass}
            errorIcon={false}
            errorMessage={error.pass}
            errorMessagePosition="title"
            onRight={handleGetCaptcha}
            right={
              type === 1 ? (
                <Text style={{ lineHeight: addUnit(24), color: "#0080ff" }}>
                  忘记密码
                </Text>
              ) : type === 2 && (
                <Text style={{ lineHeight: addUnit(24), color: !sendSms.canSend || (!!form.user && error.user) || !form.user ? "#999" : "#0080ff" }}>
                  {sendSms.canSend ? "获取验证码" : `${sendSms.seconds}s后重新获取`}
                </Text>
              )
            }
            confirmType="done"
            onConfirm={()=>{
              if((!!error.user || !!error.pass) || !form.user || !form.pass) return;
              loginSubmit();
            }}
          />
        </View>
        <View className="sign-action">
          <Button
            type="info"
            size="medium"
            onClick={loginSubmit}
            disabled={(!!error.user || !!error.pass) || !form.user || !form.pass}
          >
            立即登录
          </Button>
        </View>
        <View className="sign-tips">
          <Text className="sign-tips__text">登录即表示已阅读并同意</Text>
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
            type="info"
            hairline
            onClick={() => {
              navigateTo({ url:"/pages/sign/register/index",method:"navigateTo",mustLogin:false });
            }}
          >
            免费注册
          </Button>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Login;
