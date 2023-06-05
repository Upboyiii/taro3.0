import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Image, ScrollView } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "../../memberCard/detail/index.scss";

const LevelDetail: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _disabled = getCurrentInstance().router?.params?.disabled;
  const _growth = getCurrentInstance().router?.params?.growth;

  const [detail, setDetail] = useState<any>({});
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getLevelDetail = (id)=>{
    setErr(false);
    customerApi.level.get({ id: parseInt(id) })
      .then((res)=>{
        if (!!res && res.code === 0) {
          let data = res?.data ?? {};
          setDetail(data);
        }else{
          setErr(true);
        }
      }).catch(()=>{
        setErr(true);
      }).finally(()=>{
        setLoading(false);
      });
  };

  useEffect(() => {
    if (_id) {
      getLevelDetail(_id);
    }else{
      setErr(true);
    }
  }, []);

  const handleLevelState = (state) => {
    detail.state = state;
    if(!!detail.benefit_bag && detail.benefit_bag.length > 0){
      detail.benefit_bag = detail.benefit_bag.map((obj) => {
        const { id, benefit_info: { value } } = obj;
        return { benefit_id: id, value };
      });
    }

    const title = state === 2 ? "停用" : "启用";
    const content = state === 2 ? "停用等级将对已有会员造成影响，如需停用请提前公告，以免造成不必要客诉，请谨慎操作。" : `启用等级VIP${detail.level_value}后，会员等级将重新计算， ${detail.level_value > 1 ? `原VIP${detail.level_value - 1}的会员可能会发生等级变动，` : ""}变动将在一段时间内完成`;

    Taro.showModal({
      title: title + "等级？",
      content: content,
      cancelText: "我再想想",
      confirmText: "确定" + title,
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          customerApi.level.edit(detail).then((res: any) => {
            if (res.code === 0) {
              eventCenterTrigger("levelEdit");
              navigateTo({ method: "navigateBack" });
            }
          }).catch(res=>{
            Taro.showToast({ title: res.message, icon: "none" });
          }).finally(()=>{
            setLoading(false);
          });
        }
      }
    });

  };

  const [bem] = createNamespace("card","member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className={classnames(bem("card"),"card")} style={{ marginTop: addUnit(12) }}>
          <Skeleton
            loading={loading}
            align="start"
            title
            titleSize={[72,24]}
            row={1}
            rowWidth={144}
            action
            actionRound
          >
            <View className={classnames(bem("backdrop"))} style={{ backgroundColor: detail.color_code || "#646666" }}>
              <Image
                className={classnames(bem("backdrop-watermark"))}
                src={detail.type === 1 ? require("@/assets/card/level-vip.png") : require("@/assets/card/level-svip.png")}
                mode="aspectFill"
              />
              {detail.cover_url && detail.cover_url !== "" && detail.cover_url !== "string" ? (
                <Image className={classnames(bem("backdrop-image"))} src={base.file_host + "/" + detail.cover_url} mode="aspectFill" />
              ) : null}
            </View>
            <View className={classnames(bem("genre"))} style={{ paddingLeft: addUnit(20) }}>
              <Tag
                plain={false}
                mark
                size="large"
                textColor="#fff"
                color="rgba(255,255,255,.3)"
                style={{ fontWeight: "bold" }}
              >
                {`${ detail.type === 1 ? "VIP" : "SVIP"}${ detail.type === 1 ? detail.level_value : "" }`}
              </Tag>
              <View className={classnames(bem("state"))}>
                {detail.state === 2 ? "已停用" : "已启用"}
              </View>
            </View>
            <Cell
              border={false}
              title={detail.name}
              textStyle={{ color: "#fff", fontWeight: "bold", fontSize: addUnit(18) }}
              style={{ paddingLeft: addUnit(20), paddingTop: addUnit(8) }}
            />
          </Skeleton>
        </View>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {detail.benefit_bag && detail.benefit_bag.length > 0 ? (
                  <View className="card">
                    <View className="card-header card-header--border">
                      <View className="card-header__title">相关权益</View>
                    </View>
                    <View className={classnames(bem("benefit"))}>
                      {detail.benefit_bag.map(item=>{
                        return (
                          <View className={classnames(bem("benefit-bag"))} key={item.id}>
                            <Image className={classnames(bem("benefit-icon"))} src={base.file_host + "/" + item.icon} mode="aspectFill" />
                            <View className={classnames(bem("benefit-name"))}>{item.name}</View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                <View className="card">
                  <View className="card-header card-header--border">
                    <View className="card-header__title">基础信息</View>
                  </View>
                  <Cell
                    border={false}
                    title="会员名称"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={detail.name}
                    contentAlign="left"
                    style={{ paddingBottom: 0 }}
                  />
                  <Cell
                    border={false}
                    title="获取条件"
                    align="start"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    contentAlign="left"
                    content={detail.type === 1 ? `需注册会员${ detail?.free_growth || 0 }成长值` : "需付费购买"}
                    contentStyle={{ fontWeight: "bold" }}
                    style={{ paddingTop: 0 }}
                  />
                  {detail.type === 2 && detail.vip_rule && detail.vip_rule.length > 0 ? detail.vip_rule.map((rule, idx) => {
                    return (
                      <Cell
                        key={`rule-${idx}`}
                        title={rule.term_name}
                        content={`${rule.term_days}天 · `}
                        extraStyle={{ marginLeft: 0, fontSize: addUnit(14), color: "#ff2340" }}
                        extra={`¥${formatPrice(rule.price)}`}
                      />
                    );
                  }) : null}
                </View>
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View className="card">
              <View className="card-header card-header--border">
                <Skeleton title titleSize={[64, 16]} compact />
              </View>
              <View className="card-body" style={{ display:"flex", flexDirection:"row" }}>
                {Array(5)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        animate={false}
                        align="center"
                        direction="column"
                        contentAlign="center"
                        image
                        imageShape="round"
                        imageSize={40}
                        title
                        titleSize={[36, 10]}
                        style={{ flex: 1 }}
                      />
                    );
                  })}
              </View>
            </View>
            <View className="card">
              <View className="card-header card-header--border">
                <Skeleton title titleSize={[64, 16]} compact />
              </View>
              <View className="card-body">
                {Array(2)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        compact
                        contentDirection="row"
                        rowsAlign="between"
                        rowsDirection="row"
                        row={2}
                        rowWidth={[60, 60]}
                        rowHeight={12}
                        style={i !== 0 ? { paddingTop: addUnit(12) } : undefined}
                      />
                    );
                  })}
              </View>
            </View>
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        {!loading ? (
          <React.Fragment>
            {detail.type === 2 || detail.type === 1 && (!_disabled || _disabled && (parseInt(_disabled) === detail.level_value || parseInt(_disabled) === detail.level_value - 1)) ? (
              <React.Fragment>
                {detail.state === 1 ? (
                  <Button
                    style={{ flex: 1, marginRight: addUnit(12) }}
                    type="primary"
                    hairline
                    onClick={() => {
                      handleLevelState(2);
                    }}
                  >
                    停用
                  </Button>
                ) : detail.state === 2 ? (
                  <Button
                    style={{ flex: 1, marginRight: addUnit(12) }}
                    type="primary"
                    onClick={() => {
                      handleLevelState(1);
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
              onClick={() => {;
                navigateTo({ url: "/pages/customer/level/edit/index", method:"navigateTo", params: { id: detail.id, type: detail.type, growth: _growth } });
              }}
            >
              编辑
            </Button>
          </React.Fragment>
        ) : (
          <Skeleton compact title titleSize={["100%", 44]} round color="#fff" style={{ backgroundColor: "transparent" }} />
        )}
      </BottomBar>
    </View>
  );
};

export default LevelDetail;
