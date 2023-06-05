import React, { FC } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import Field from "@/components/field";
import "./index.scss";
import Button from "@/components/button";

const My: FC = () => {

  return (
    <React.Fragment>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <Field
          border={false}
          title="原密码"
          placeholder="请输入原密码"
        />
        <Field
          title="新密码"
          placeholder="请输入新的密码"
        />
        <Field
          title="确认密码"
          placeholder="请再次输入新的密码"
        />
      </View>
      <View className="card-tips">
        8-20位字符，包含字母和数字，建议字母包含大小写组合。
      </View>
      <View className="bottom-bar">
        <Button
          style={{ width: "70%" }}
          type="info"
          // onClick={}
        >
          确认修改
        </Button>
      </View>
    </React.Fragment>
  );
};

export default My;
