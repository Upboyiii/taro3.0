import React, { FC, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import Cell from "@/components/cell";
import Popup from "@/components/popup";
import "./index.scss";
import Field from "@/components/field";
import Button from "@/components/button";

const My: FC = () => {

  const sexList = ["保密","男","女"];
  const [show, setShow] = useState(false);
  // @ts-ignore
  const [form, setForm] = useState({
    avatar: "https://img14.360buyimg.com/pop/jfs/t1/138480/1/24677/141681/61a239e4Effd6e2ab/ea09bd3fbcc6270b.jpg",
    nick_name: "彩豚",
    sex: 0
  });

  return (
    <React.Fragment>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <Cell
          border={false}
          title="头像"
          arrow
          clickable
          extra={
            <Image
              style={{ width: addUnit(60), height: addUnit(60), borderRadius: addUnit(6) }}
              src={form.avatar}
              mode="aspectFill"
            />
          }
          onClick={()=>{
            Taro.chooseImage({
              count: 1, // 默认9
              sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
              sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
              success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths;
                console.log(tempFilePaths,"tempFilePaths");
              }
            });
          }}
        />
      </View>
      <View className="card">
        <Cell
          border={false}
          title="手机号码"
          content="18143300050"
          contentStyle={{ color: "#666" }}
          onClick={()=>{
            Taro.navigateTo({ url: "/pages/store/list/index" });
          }}
        />
        <Cell
          title="昵称"
          content={form.nick_name}
          contentStyle={{ color: "#666" }}
          arrow
          clickable
          onClick={()=>{setShow(true);}}
        />
        <Cell
          title="性别"
          content={sexList[form.sex]}
          contentStyle={{ color: "#666" }}
          arrow
          clickable
          onClick={()=>{
            Taro.showActionSheet({
              alertText: "修改性别",
              itemList: sexList,
              success: function (res) {
                setForm(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.sex = res.tapIndex;
                  return temp;
                });
              },
              fail: function (res) {
                console.log(res.errMsg);
              }
            });
          }}
        />
      </View>
      <View className="card">
        <Cell
          border={false}
          title="修改密码"
          arrow
          clickable
          onClick={()=>{
            Taro.navigateTo({ url: "/pages/my/password/index" });
          }}
        />
      </View>
      <Popup show={show} title="修改昵称" position="full" bgColor="#f7f8f8" onClose={()=>{setShow(false);}}>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            clearable
            value={form.nick_name}
            placeholder="请输入昵称"
            onChange={(val)=>{
              setForm(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.nick_name = val;
                return temp;
              });
            }}
          />
        </View>
        <View className="bottom-bar">
          <Button
            style={{ width: "70%" }}
            type="info"
            onClick={()=>{
              setShow(false);
            }}
          >
            确认修改
          </Button>
        </View>
      </Popup>
    </React.Fragment>
  );
};

export default My;
