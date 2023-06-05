import React, { FC, useEffect, useState } from "react";
import { Text, View } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import { formatPrice } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Pie from "@/components/Echarts/pie";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import classnames from "classnames";
import "./index.scss";

const FoodsStats: FC = () => {

  const init = {
    pay_order: 0,
    pay_amount: 0,
    un_pay_amount: 0,
    un_pay_order: 0,
    eat_nums: 0,
    total_eat_nums: 0,
    total_meal_nums: 0,
    eat_time: 0,
    total_desk_nums: 0,
    total_use_desk_nums: 0,
    use_desk_nums: 0,
    desk_group: [
      {
        id: 0,
        name: "",
        total_nums: 0,
        use_nums: 0,
        desk_nums: 0
      }
    ]
  };
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [stats, setStats] = useState<any>(init);
  const [percent, setpercent] = useState({
    use: "",
    kong: "",
    total: null
  });


  useEffect(() => {
    getStats();
  }, []);

  // 获取统计接口
  const getStats = () => {
    setLoading(true);
    setErr(false);
    pluginApi.plugin("GET", 312, "getCensus", JSON.stringify({}))
      .then(res => {
        // console.log(res, "res");
        if (!!res && res.code === 0) {
          if (res.data) {
            const _data = Object.assign({}, init, res?.data || {});
            const _total_desk_nums = _data?.total_desk_nums || 0;
            const _kong_desk_nums = (_data?.total_desk_nums || 0) - (_data?.use_desk_nums || 0);
            const _use_desk_nums = _data?.use_desk_nums || 0;
            setStats(_data);
            setpercent({
              use: _use_desk_nums ? ((_use_desk_nums / _total_desk_nums) * 100).toFixed(2) : "0",
              kong: _kong_desk_nums ? ((_kong_desk_nums / _total_desk_nums) * 100).toFixed(2) : "0",
              total: _total_desk_nums
            });
          }
        } else {
          setErr(true);
        }
      }).catch(() => {
        setErr(true);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };


  const getMaxTai = (item) => {
    const a: any = (((item.desk_nums ? item.desk_nums : 0) / (item.total_nums ? item.total_nums : 0)));
    const b = (a * 100).toFixed(2);
    return b;
  };
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () =>{
    setRefreshing(true);
    setTimeout(()=>{
      getStats();
    },500);
  };

  const [bem] = createNamespace("stats", "foods");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View
          className={classnames(bem())}
          onClick={() => {
            navigateTo({ method: "navigateTo", url: "/pages/foods/status/index" });
          }}
        >
          <View className={classnames(bem("item"))}>
            <View className="hairline hairline--bottom" style={{ left: addUnit(16) }} />
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>已结算金额(元)</View>
              <Tag size="small" type="info" className={classnames(bem("badge"))}>{stats.pay_order ? stats.pay_order : 0}单</Tag>
            </View>
            <View className={classnames(bem("body"))}>
              {!loading ? (
                <React.Fragment>
                  <Text className={classnames(bem("nums"))}>
                    {formatPrice(stats?.pay_amount || 0).split(".")[0]}
                  </Text>
                  <Text className={classnames(bem("unit"))}>
                    {`.${formatPrice(stats?.pay_amount || 0).split(".")[1]}`}
                  </Text>
                </React.Fragment>
              ) : (
                <Text className={classnames(bem("nums"))}>-.--</Text>
              )}
            </View>
          </View>
          <View className={classnames(bem("item"))}>
            <View className="hairline hairline--bottom" style={{ right: addUnit(16) }} />
            <View className="hairline hairline--left" style={{ top: addUnit(16) }} />
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>待结算金额(元)</View>
              <Tag size="small" type="info" className={classnames(bem("badge"))}>{stats?.un_pay_order ||  0}单</Tag>
            </View>
            <View className={classnames(bem("body"))}>
              {!loading ? (
                <React.Fragment>
                  <Text className={classnames(bem("nums"))}>
                    {formatPrice(stats?.un_pay_amount || 0).split(".")[0]}
                  </Text>
                  <Text className={classnames(bem("unit"))}>
                    {`.${formatPrice(stats?.un_pay_amount || 0).split(".")[1]}`}
                  </Text>
                </React.Fragment>
              ) : (
                <Text className={classnames(bem("nums"))}>-.--</Text>
              )}
            </View>
            {/* <Text className={classnames(bem("footer"))}>
              待付{stats.un_pay_amount ? stats.un_pay_amount : 0}.00元
            </Text> */}
          </View>
          <View className={classnames(bem("item"))}>
            <View className="hairline hairline--bottom" style={{ left: addUnit(16) }} />
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>上座率</View>
            </View>
            <View className={classnames(bem("body"))}>
              <Text className={classnames(bem("nums"))}>
                {!loading ? (((stats?.total_eat_nums || 0) / (stats?.total_meal_nums || 1)) * 100).toFixed(2) : "-.--"}
              </Text>
              <Text className={classnames(bem("unit"))}>%</Text>
            </View>
          </View>
          <View className={classnames(bem("item"))}>
            <View className="hairline hairline--bottom" style={{ right: addUnit(16) }} />
            <View className="hairline hairline--left" style={{ borderColor: "#e5e5e5" }} />
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>翻台率</View>
            </View>
            <View className={classnames(bem("body"))}>
              <Text className={classnames(bem("nums"))}>
                {!loading ? ((((stats?.total_use_desk_nums || 0) - (stats?.total_desk_nums || 0)) / (stats?.total_desk_nums || 1)) * 100).toFixed(2) : "-.--"}
              </Text>
              <Text className={classnames(bem("unit"))}>%</Text>
            </View>
          </View>
          <View className={classnames(bem("item"))}>
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>正在用餐人数</View>
            </View>
            <View className={classnames(bem("body"))}>
              <Text className={classnames(bem("nums"))}>
                {!loading ? (stats?.eat_nums || 0) : "-"}
              </Text>
              <Text className={classnames(bem("unit", "small"))}>人</Text>
            </View>
          </View>
          <View className={classnames(bem("item"))}>
            <View className="hairline hairline--left" style={{ bottom: addUnit(16) }} />
            <View className={classnames(bem("header"))}>
              <View className={classnames(bem("title"))}>平均用餐时长</View>
            </View>
            <View className={classnames(bem("body"))}>
              <Text className={classnames(bem("nums"))}>
                {!loading ? stats?.eat_time || 0 : "--"}
              </Text>
              <Text className={classnames(bem("unit", "small"))}>分钟</Text>
            </View>
          </View>
        </View>

        <View className="card">
          <View className="card-header">
            <View className="card-header__title">实时桌台</View>
          </View>
          {!err ? (
            <React.Fragment>
              <View
                style={{ padding: addUnit(32), paddingBottom: addUnit(16) }}
                // onClick={getStats}
              >
                <Pie
                  options={[
                    { value: percent.use, color: "#4579f5" },
                    { value: percent.kong, color: "#edf5fe" }
                  ]}
                  titleStyle={{ fontSize: addUnit(36), color: "#000", marginTop: 0, marginBottom: 0, fontWeight: "bold" }}
                  title={!loading ? stats.use_desk_nums || 0 : "--"}
                  text="使用中桌台"
                  textStyle={{ color: "#666" }}
                />
              </View>
              <View className={classnames(bem("percentage"))}>
                <View className={classnames(bem("percent"))}>
                  <View className={classnames(bem("percent-icon", "ing"))} />
                  <Text className={classnames(bem("percent-text"))}>使用中占比{!loading ? percent.use || 0 : "-.--"}%</Text>
                </View>
                <View className={classnames(bem("percent"))}>
                  <View className={classnames(bem("percent-icon", "kong"))} />
                  <Text className={classnames(bem("percent-text"))}>空闲占比{!loading ? percent.kong || 0 : "-.--"}%</Text>
                </View>
              </View>
              <View className={classnames(bem("list"))}>
                <View className={classnames(bem("row", "header"))}>
                  <View className={classnames(bem("cell", "area"))} style={{ color: "#999" }}>桌台区域</View>
                  <View className={classnames(bem("cell", "ing"))} style={{ color: "#999" }}>使用中/总桌台</View>
                  <View className={classnames(bem("cell", "use"))} style={{ color: "#999" }}>实时开台率</View>
                </View>
                {stats.desk_group?.map((item, index) => {
                  return (
                    <View className={classnames(bem("row"))} key={index}>
                      <View className={classnames(bem("cell", "area"))}>{item.name}</View>
                      <View className={classnames(bem("cell", "ing"))}>
                        <Text className={classnames(bem("cell-num", "blue"))}>{item?.use_nums || 0}</Text>
                        <Text className={classnames(bem("cell-num"))}>/{item?.total_nums || 0}</Text>
                      </View>
                      <View className={classnames(bem("cell", "use"))}>
                        <Text className={classnames(bem("cell-num"))}>{getMaxTai(item)}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </React.Fragment>
          ) : (
            <Empty desc="加载错误，请返回重试" image="error" />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodsStats;
