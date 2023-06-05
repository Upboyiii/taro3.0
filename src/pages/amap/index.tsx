// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { Input, View, Image, Map, ScrollView, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import QQMapWX from '@/utils/mapjs/qqmap-wx-jssdk.min.js';
import { debounce } from "@/utils/common";
import { addUnit } from "@/components/utils";
// @ts-ignore
import Locate from "@/assets/icons/locate.png";
// @ts-ignore
import Marker from "@/assets/icons/marker.png";
// @ts-ignore
import Check from "@/assets/icons/check.png";
import "./style.scss"

let QQMapSDK = null as any;
const amap: FC = () => {

  const qMapKey = 'GJNBZ-W5ECI-UHVGU-UKQZ4-W4WGQ-OQBNB'
  const [searchVal, setsearchVal] = useState("")
  const [nearbyBuilding, setnearbyBuilding] = useState<any>([])
  const [markers, setmarkers] = useState<any>([{
    // 标记点
    iconPath: Marker,
    id: 0, // 标记点 id marker 点击事件回调会返回此 id。建议为每个 marker 设置上 number 类型 id，保证更新 marker 时有更好的性能。
    latitude: 28.21359, // 纬度
    longitude: 112.88868, // 经度
    width: 35, // 标注图标高度
    height: 35, // 标注图标宽度
  }])
  const [Location, setLocation] = useState({})
  const [detailAdres, setdetailAdres] = useState<any>({})
  const [SId, setSId] = useState(0)

  useEffect(() => {
    // 实例化API核心类
    QQMapSDK = new QQMapWX({
      key: 'GJNBZ-W5ECI-UHVGU-UKQZ4-W4WGQ-OQBNB',
      mapStyleId: 'style1', // 个性化地图
    });
    Taro.getLocation({
      type: 'gcj02',
      success: function (res) {
        // 获取周边建筑信息
        QQMapSDK.search({
          keyword: searchVal || '公司',
          boundary: `nearBy(${res.latitude},${res.longitude},5000)`,
          page_size: 20,
          success: (searchRes) => {
            console.log(searchRes);
            setSId(searchRes.data[0].id)
            setnearbyBuilding(searchRes.data)
          },
          fail: function (searchRes) {
            console.log(searchRes, "错误");
          },
        });
        const obj = {
          ...markers[0],
          latitude: res.latitude,
          longitude: res.longitude
        }
        setmarkers([obj])
      },
    });
  }, [])

  const handleMarkerClick = (e) => {
    console.log(e, "点击标准");
  };

  const handleRegionChange = (e) => {
    setLocation(e.detailcenterLocation)
  };

  /**
   * @desc 搜索框事件
   * @param { object } 
   */
  const handleSearchValChange = (e) => {
    if (e.detail.value) {
      QQMapSDK.search({
        keyword: e.detail.value,
        page_size: 20,
        page_index: 1,
        location: `${markers[0].latitude},${markers[0].longitude}`,
        success: function (searchRes) {
          console.log("searchRes", searchRes)
          setnearbyBuilding(searchRes.data)
        },
        fail: function (searchRes) {
          console.log(searchRes);
        },
      });
      setsearchVal(e.detail.value)
    }
  };

  /**
   * @desc 列表项点击事件
   * @param  item 点击对象
   * 
   */
  const handleNearbyClick = (item) => {
    setSId(item.id)
    setdetailAdres(item)
    const lat = item.location.lat.toFixed(6)
    const lng = item.location.lng.toFixed(6)
    // 设置当前位置
    const obj = {
      // 标记点
      ...markers[0],
      latitude: lat, // 纬度
      longitude: lng, // 经度
    };
    setmarkers([obj])
  };

  /**
   * 确认地址
   */
  const onSubmit = () => {
    Taro.navigateBack({ delta: 1 })
    Taro.eventCenter.trigger("wx_Map", detailAdres.address ? detailAdres : "");
  }

  /**
   *  点击定位
   */
  const handleOperation = () => {
    Taro.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("res", res)
        const obj = {
          // 标记点
          ...markers[0],
          latitude: res.latitude, // 纬度
          longitude: res.longitude, // 经度
        };
        setmarkers([obj])
      }
    })
  };


  return (
    <View className="homeWrap">
      <View className="UpBtn">
        <View className="cancel"  onClick={() => onSubmit()}>取消</View>
        <Button size="default" className="ok" onClick={() => onSubmit()}>完成</Button>
      </View>
      <Map
        className="mapDom"
        subkey={qMapKey}
        longitude={markers[0].longitude}
        latitude={markers[0].latitude}
        scale={16}
        markers={markers}
        onMarkerTap={(e) => handleMarkerClick(e)}
        onRegionChange={(e) => debounce(handleRegionChange(e), 500)}
        showLocation
      />
      <View
        style={{
          zIndex: 50,
          position: "absolute",
          right: addUnit(15),
          bottom: addUnit(50),
          padding: addUnit(4),
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: "0 0 5px silver"
        }}
        onClick={() => {
          handleOperation();
        }}>
        <Image style={{ display: "block", width: addUnit(24), height: addUnit(24) }} src={Locate} />
      </View>
      <View className="searchDom">
        <Input
          value={searchVal}
          onInput={(e) => handleSearchValChange(e)}
          className="inputDom"
          placeholder="搜索地点"
        />
      </View>
      <ScrollView className="scrollDom" scrollY scrollWithAnimation>
        {nearbyBuilding.map((item) => (
          <>
            <View
              key={item.id}
              className="nearbyBuilding"
              onClick={() => handleNearbyClick(item)}
            >
              <View className="nearbyTitle">{item.title}</View>
              <View className="nearbyAddr">{item.address}</View>
            </View>
            {item.id === SId ?
              <View className="nearbyDown">
                <Image style={{ width: addUnit(20), height: addUnit(20) }} className="nearbyDown_Img" src={Check} />
              </View> : null
            }
          </>
        ))}
      </ScrollView>
    </View >
  );
};

export default amap;
