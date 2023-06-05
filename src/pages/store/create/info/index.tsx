// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { useLoad, useRouter } from "@tarojs/taro";
import { Text, View, ScrollView, Image } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { userApi } from "@/api/user";
import { cityData } from "@/components/city-select/cityDate";
import { useDispatch } from "react-redux";
import Field from "@/components/field";
import Button from "@/components/button";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import CitySelect from "@/components/city-select";
import classnames from "classnames";
import "../../create/index/index.scss";

let CountyArr1 = [] as any;
const CreateInfo: FC = () => {
  const [bem] = createNamespace("store", "create");
  const router = useRouter();
  const type: any = router.params.type;    // 所属企业分类ID 主业
  const chain: any = router.params.mode;    // 连锁模式 1单店面 2多店面
  // @ts-ignore
  const dispatch = useDispatch();
  // @ts-ignore
  const [MapDetail, setMapDetail] = useState<any>({});
  const [cityShow, setCityShow] = useState(false);
  const [formErr, setFormErr] = useState({
    name: "",
    phone: "",
    county_id: "",
    address: ""
  });
  const [storeForm, seSstoreForm] = useState(
    {
      chain: Number(chain),
      loc: [] as any[],
      name: "",
      logo: "",
      store_data: {
        county_id: "",
        phone: "",
        address: ""
      },
      type: Number(type), // 主业
      type_ids: [Number(type)]// 副业
    }
  );
  const [Latitude1, setLatitude1] = useState(28.23148);
  const [Longitude1, setLongitude1] = useState(113.00307);
  const [countyLabel, setCountyLabel] = useState("");
  // @ts-ignore
  const [RegoinList, setRegoinList] = useState([]);  // / 获取省市县数据
  const [CityValue, setCityValue] = useState(0);

  useLoad(() => {
    Taro.getLocation({
      isHighAccuracy: true, // 开启高精度定位
      // altitude: true, // 传入 true 会返回高度信息，由于获取高度需要较高精确度，会减慢接口返回速度
      type: "gcj02", // wgs84 返回 gps 坐标，gcj02 返回可用于 openLocation 的坐标
      // highAccuracyExpireTime: 3000, // 高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果
      success: function (res) {
        console.log("res", res);
        setLatitude1(res.latitude);
        setLongitude1(res.longitude);
      }
    });
  });

  const regionsFormat = (data, value) => {
    if (data) {
      let children1 = [] as any;
      let children2 = [] as any;
      let regions_obj: any = {}, regions_tree: any[] = [];
      data.forEach(item => {
        item.level = 1;
        if (item.children && item.children.length > 0) {
          item.children.forEach(son => {
            son.level = 2;
            if (son.children && son.children.length > 0) {
              son.children.forEach(grandson => {
                grandson.level = 3;
              });
            }
          });
        }
        regions_tree.push(item);
        regions_obj[item.id] = item;
      });
      let parents = getRegionsPath(value, regions_obj);
      parents.forEach((item) => {
        item.children.forEach((item1) => {
          if (item1.id === CountyArr1[1]) {
            children1.push(item1);
            item1.children.forEach((item2) => {
              if (item2.id === CountyArr1[2]) {
                children2.push(item2);
              }
            });
          } else {
            if (item1.id === CountyArr1[2]) {
              children2.push(item1);
            }
          }
        });
      });
      if (children1.length > 0) {
        parents.push(children1[0]);
      }
      if (children2.length > 0) {
        parents.push(children2[0]);
      }
      console.log("主页面", parents);
      citySelectConfirm(parents);
    }
  };

  const getRegionsPath = (county_id, regions_obj) => {
    let parents: any[] = [], id: string = county_id + "";
    let county_arr = [id.slice(0, 2).padEnd(6, "0"), id.slice(0, 4).padEnd(6, "0"), id];
    county_arr = Array.from(new Set(county_arr));
    const newArr = county_arr.map(Number);
    CountyArr1 = newArr;
    parents = county_arr
      .map(county => {
        return regions_obj[county];
      })
      .filter(item => !!item);
    // console.log(parents);
    return parents;
  };

  useEffect(() => {
    // getregion()
    Taro.eventCenter.on("Map", (res) => {
      console.log("res", res.addressComponent);
      setMapDetail(res);
      const a = Number(res.addressComponent.adcode);
      setCityValue(a);
      regionsFormat(cityData, a);
      handleChange(res.formatted_address, "address");
    });
    Taro.eventCenter.on("wx_Map", (res) => {
      if (res) {
        setMapDetail(res);
        setCityValue(res.ad_info.adcode);
        regionsFormat(cityData, res.ad_info.adcode);
        handleChange(res.address, "address");
      }
      setCityShow(false);
    });
    return () => {
      Taro.eventCenter.off("Map");
      Taro.eventCenter.off("wx_Map");
    };
  }, []);

  // 获取省市县
  // @ts-ignore
  const getregion = () => {
    userApi.user.getregion({ id: -1 }).then(res => {
      setRegoinList(res.data);
    });
  };

  const citySelectConfirm = (data) => {
    console.log("data", data);
    let city: string = "",
      county_id = 0;
    if (Array.isArray(data) && data.length > 0) {
      county_id = Number(data.slice(-1)[0].id);
      data.map((item, index) => {
        if (index !== 0) city += "/";
        city += item.label;
      });
    }
    seSstoreForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.store_data.county_id = county_id;
      setCountyLabel(city);
      return temp;
    });
    verifyForm(false, String(county_id), "county_id");
  };

  // 获取表单信息
  const handleChange = (val, mode) => {
    seSstoreForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if (mode === "phone" || mode == "county_id" || mode == "address") {
        temp.store_data[mode] = val;
      }
      if (mode === "name") {
        temp[mode] = val;
      }
      return temp;
    });
    verifyForm(false, val, mode);
  };

  const verifyForm = (callback = false, val = "", ref = "") => {
    let verify = true;
    setFormErr(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let err = {
        name: "请输入店铺名称",
        phone: "请输入正确的手机号码",
        county_id: "请选择所在地区",
        address: "请输入详情地址"
      };
      if (!!ref) {
        temp[ref] = !val ? err[ref] : "";
      } else {
        const phoneReg = /^1[3456789]\d{9}$/;
        temp.name = storeForm.name === "" ? err.name : "";
        temp.phone = !phoneReg.test(storeForm.store_data.phone) ? err.phone : "";
        temp.county_id = storeForm.store_data.county_id === "" ? err.county_id : "";
        temp.address = storeForm.store_data.address === "" ? err.address : "";
        verify = !(!!temp.phone || !!temp.name || !!temp.county_id || !!temp.address);
      }
      return temp;
    });
    if (callback) {
      return verify;
    }
  };

  // 提交同意并开店
  const onSubmit = () => {
    console.log("chain", chain)
    const verify = verifyForm(true);
    if (!verify) return;
    if (MapDetail) {
      // const a = MapDetail.addressComponent.streetNumber.location.split(",");
      storeForm.loc[0] = process.env.TARO_ENV === "rn" ? Number(MapDetail.addressComponent.streetNumber.location.split(",")[0]) : MapDetail.location.lng;
      storeForm.loc[1] = process.env.TARO_ENV === "rn" ? Number(MapDetail.addressComponent.streetNumber.location.split(",")[1]) : MapDetail.location.lat;
      goRegisterUser();
    } else {
      getPositions();
    }
  };

  // 获取经纬度
  const getPositions = () => {
    const key = "3692bdb97a009ca2dd764fb707f1e913";   // 测试高德key
    const a = countyLabel.replace(/\\|\//g, "");
    const address = a + storeForm.store_data.address;
    fetch(`https://restapi.amap.com/v3/geocode/geo?key=${key}&address=${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then((response) => response.json())
      .then((jsonData) => {
        const result = jsonData.geocodes[0].location.split(",");
        storeForm.loc[0] = Number(result[0]);
        storeForm.loc[1] = Number(result[1]);
        goRegisterUser();
      })
      .catch((error) => {
        storeForm.loc = [];
        console.error(error);
      });
  };

  // 同意协议并开店
  const goRegisterUser = () => {
    userApi.admin.registerUser(storeForm, { successToast: false }).then(res => {
      if (res.code === 0) {
        // 调取状态接口
        // Taro.showLoading({
        //   title: '加载中...',
        // })
        getState(res.data.store_id);
      }
    });
  };

  // 状态接口
  const getState = (id: any) => {
    const timer = setInterval(() => {
      userApi.admin.registerState({ store_id: id }, { successToast: false }).then(res => {
        if (res.data.state === 1 && res.data.state > 0) {
          // Taro.hideLoading()
          clearInterval(timer);
          Taro.reLaunch({ url: "/pages/index/index" });
        } else {
          clearInterval(timer);
        }
      });
    }, 2000);
  };

  const onParamsUrl = () => {
    storeForm.store_data.address = "";
    Taro.navigateTo({ url: `/pages/amap/index?latitude=${Latitude1}&longitude=${Longitude1}` });
  };


  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {/* <View className={classnames(bem("header"))}>*/}
      {/*  <View className={classnames(bem("header-title"))}>店铺信息</View>*/}
      {/*  <View className={classnames(bem("header-desc"))}>3步极速开店</View>*/}
      {/* </View>*/}
      {/* <View className={classnames(bem("title"))}>填写店铺相关信息</View>*/}
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className={classnames("card")} style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            required
            className={classnames(bem("field"))}
            title="店铺名称"
            name="user"
            value={storeForm.name}
            placeholder="建议10字以内"
            maxlength={10}
            showWordLimit
            errorIcon={false}
            error={!!formErr.name}
            errorMessage={formErr.name}
            onChange={(val) => handleChange(val, "name")}
          />
          <Field
            required
            className={classnames(bem("field"))}
            type="tel"
            title="联系电话"
            value={storeForm.store_data.phone}
            placeholder="请输入联系电话"
            errorIcon={false}
            error={!!formErr.phone}
            errorMessage={formErr.phone}
            onChange={(val) => handleChange(val, "phone")}
          />
          <Cell
            compact
            rightStyle={{ padding: addUnit(12) }}
            rightIcon={
              <Image
                style={{ width: addUnit(20), height: addUnit(20) }}
                src={require("@/assets/icons/map.png")}
              />
            }
            onRight={onParamsUrl}
          >
            <Field
              border={false}
              required
              title="所在地区"
              className={classnames(bem("field"))}
              input={false}
              // arrow
              clickable
              placeholder="请选择省/市/区"
              value={countyLabel}
              errorIcon={false}
              error={!!formErr.county_id}
              errorMessage={formErr.county_id}
              onClick={() => {
                setCityShow(true);
              }}
            />
          </Cell>
          <Field
            required
            className={classnames(bem("field"))}
            type="textarea"
            title="详细地址"
            placeholder="请填写详细地址，如街道名称，门牌号等信息"
            value={storeForm.store_data.address}
            errorIcon={false}
            error={!!formErr.address}
            errorMessage={formErr.address}
            onChange={(val) => { handleChange(val, "address"); }}
          />
        </View>
      </ScrollView>
      <BottomBar direction="column">
        <Button
          style={{ width: "70%" }}
          size="medium"
          type="info"
          onClick={onSubmit}
        >
          同意协议并开店
        </Button>
        <View className={classnames(bem("tips"))}>
          <Text className={classnames(bem("tips-text"))}>开店即代表你已同意</Text>
          <Text
            className={classnames(bem("tips-text", "link"))}
            onClick={() => {
              Taro.navigateTo({ url: `/pages/webView/index?url=http://www.mall.com/rule/service/&title=彩豚软件服务协议` });
            }}
          >
            《彩豚软件服务协议》
          </Text>
        </View>
      </BottomBar>
      <CitySelect
        value={CityValue}
        show={cityShow}
        onCancel={() => {
          setCityShow(false);
        }}
        onConfirm={citySelectConfirm}
      />
    </View>
  );
};

export default CreateInfo;
