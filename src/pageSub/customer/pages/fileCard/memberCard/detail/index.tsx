import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Image, ScrollView, View } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatClaimType, formatLifeTime } from "../utils";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const MemberCardDetail: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _approval = getCurrentInstance().router?.params?.approval;

  const [detail, setDetail] = useState<any>({});
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCardDetail = (id) => {
    setErr(false);
    customerApi.benefitCard.get({ id })
      .then((res: any) => {
        if (!res.error && res.code === 0) {
          let data = res?.data ?? {};
          // console.log(data, "datas");
          setDetail(data);
        } else {
          setErr(true);
        }
      }).catch(() => {
        setErr(true);
      }).finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!!_id) {
      getCardDetail(Number(_id));
    }
  }, []);

  const handleCardState = (state, title) => {
    detail.state = state;
    if(!!detail.benefit_bag && detail.benefit_bag.length > 0){
      detail.benefit_bag = detail.benefit_bag.map((obj) => {
        const { id, benefit_info: { value } } = obj;
        return { benefit_id: id, value };
      });
    }
    if (state === 1) {
      // 上架
      setLoading(true);
      customerApi.benefitCard.edit(detail).then((res: any) => {
        if (res.code === 0) {
          eventCenterTrigger("memberCard");
          navigateTo({ method: "navigateBack" });
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
        Taro.showToast({ title: res.message, icon: "none" });
      }).finally(()=>{
        setLoading(false);
      });
    }else{
      Taro.showModal({
        title: `${title}此权益卡？`,
        content: `确定要${title}此权益卡么，请谨慎操作！`,
        cancelText: "我再想想",
        confirmText: `确定${title}`,
        confirmColor: "#ff2340",
        success: function (res) {
          if (res.confirm) {
            setLoading(true);
            customerApi.benefitCard.edit(detail).then((res: any) => {
              if (res.code === 0) {
                eventCenterTrigger("memberCard");
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
    }
  };

  const findClaimType = item => {
    const claim: any = formatClaimType(item, true);
    if (typeof claim === "string") {
      return claim;
    } else {
      if (claim.list) {
        return (
          <React.Fragment>
            <View style={{ fontWeight: "bold", paddingTop: addUnit(2), paddingBottom: addUnit(2) }}>{claim.text}</View>
            {claim.list.length > 0 ? claim.list.map((item, index) => {
              return (
                <View style={{ color: "#666", fontSize: addUnit(12) }} key={index}>
                  {`${item}${index !== claim.list.length - 1 ? "；" : "。"}`}
                </View>
              );
            }) : null}
          </React.Fragment>
        );
      }
      return <View className="my-member-card__claim-text">{claim.text}</View>;
    }
  };

  const [bem] = createNamespace("card", "member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation scrollY style={scrollViewStyle()}>
        <View className={classnames(bem("card"), "card")} style={{ marginTop: addUnit(12) }}>
          <Skeleton
            loading={loading}
            align="start"
            title
            titleSize={[72, 24]}
            row={1}
            rowWidth={144}
            action
            actionRound
          >
            <View className={classnames(bem("backdrop"))} style={{ backgroundColor: detail.color_code || "#646666" }}>
              <Image className={classnames(bem("backdrop-watermark"))} src={require("@/assets/card/level-benefit.png")} mode="aspectFill" />
              {detail.cover_url && detail.cover_url !== "" && detail.cover_url !== "string" ? (
                <Image className={classnames(bem("backdrop-image"))} src={base.file_host + "/" + detail.cover_url} mode="aspectFill" />
              ) : null}
            </View>
            <View className={classnames(bem("genre"))} style={{ paddingLeft: addUnit(20) }}>
              <Tag
                plain={false}
                size="large"
                style={{ color: "#fff", fontWeight: "bold", backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {detail.claim_type === 1 ? "无门槛卡" : detail.claim_type === 2 ? "规则卡" : detail.claim_type === 3 ? "付费卡" : null}
              </Tag>
              <View className={classnames(bem("state"))}>
                {detail.state === 2 ? "已下架" : detail.state === 3 ? "待审批" : detail.state === 4 ? "已禁用" : "使用中"}
              </View>
            </View>
            <Cell
              border={false}
              title={detail.name}
              textStyle={{ color: "#fff", fontWeight: "bold", fontSize: addUnit(18) }}
              label={formatLifeTime(detail.life_time, detail.expire_at)}
              labelStyle={{ color: "rgba(255,255,255,.5)" }}
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
                      {detail.benefit_bag.map(item => {
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
                    title="卡名称"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={detail.name}
                    contentAlign="left"
                    style={{ paddingBottom: 0 }}
                  />
                  <Cell
                    border={false}
                    title="有效期"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={formatLifeTime(detail.life_time, detail.expire_at).replace(/\u6709\u6548\u671f\uff1a/g, "")}
                    contentAlign="left"
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                  />
                  <Cell
                    border={false}
                    title="领取规则"
                    align="start"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={findClaimType(detail)}
                    contentAlign="left"
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                  />
                  <Cell
                    border={false}
                    title="每个限领次数"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={
                      detail?.repeat_limit?.is_repeatable === 2 && detail?.repeat_limit?.repeatable_limit ? `有效期内限领${detail?.repeat_limit?.repeatable_limit}次` : "不限次数"
                    }
                    contentAlign="left"
                    style={{ paddingTop: 0 }}
                  />
                  {/* <Cell*/}
                  {/*  border={false}*/}
                  {/*  title="适用店铺"*/}
                  {/*  titleStyle={{ width: addUnit(90) }}*/}
                  {/*  textStyle={{ color: "#999" }}*/}
                  {/*  // content={!!detail.store && detail.store.indexOf(-1) > -1 ? "全部店铺可用" : ""}*/}
                  {/*  content="这个还未做好"*/}
                  {/*  contentStyle={{ color: "#f00" }}*/}
                  {/*  contentAlign="left"*/}
                  {/*  style={{ paddingTop: 0 }}*/}
                  {/* />*/}
                </View>
                <View className="card">
                  <View className="card-header card-header--border">
                    <View className="card-header__title">使用设置</View>
                  </View>
                  <Cell
                    border={false}
                    title="客服电话"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={detail.service_phone || "-"}
                    contentAlign="left"
                    style={{ paddingBottom: 0 }}
                  />
                  <Cell
                    border={false}
                    align="start"
                    title="使用须知"
                    titleStyle={{ width: addUnit(90) }}
                    textStyle={{ color: "#999" }}
                    content={detail.description || "-"}
                    contentAlign="left"
                    style={{ paddingTop: 0 }}
                  />
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
              <View className="card-body" style={{ display: "flex", flexDirection: "row" }}>
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
                {Array(5)
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
            {detail.state === 1 ? (
              <React.Fragment>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  hairline
                  onClick={() => {
                    handleCardState(2, "下架");
                  }}
                >
                  下架
                </Button>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  hairline
                  onClick={() => {
                    handleCardState(4, "禁用");
                  }}
                >
                  禁用
                </Button>
              </React.Fragment>
            ) : detail.state === 2 ? (
              <React.Fragment>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    handleCardState(1, "上架");
                  }}
                >
                  上架
                </Button>
              </React.Fragment>
            ) : detail.state === 4 ? (
              <React.Fragment>
                <Button
                  style={{ flex: 1, marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    handleCardState(1, "启用");
                  }}
                >
                  启用
                </Button>
              </React.Fragment>
            ) : null}
            {detail.state === 3 ? (
              <React.Fragment>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="success"
                  loading={loading}
                  onClick={() => {
                    handleCardState(1, "通过审批");
                  }}
                >
                  通过审批
                </Button>
              </React.Fragment>
            ) : null}
            <Button
              style={{ flex: 1, maxWidth: "70%" }}
              type="info"
              loading={loading}
              onClick={() => {
                navigateTo({
                  url: "/pages/customer/memberCard/edit/index",
                  method: "navigateTo",
                  params: {
                    id: detail.id,
                    approval: _approval
                  }
                });
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

export default MemberCardDetail;
