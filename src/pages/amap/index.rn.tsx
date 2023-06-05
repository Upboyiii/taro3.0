// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { Button, Input, View, Image } from "@tarojs/components";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { MapView, MapType, Marker } from "react-native-amap3d";

const amap: FC = () => {
  const [Detail, setDetail] = useState({})
  const [Latitude, setLatitude] = useState(28.23148)
  const [Longitude, setLongitude] = useState(113.00307)
  // const [Latitude1, setLatitude1] = useState(28.23148)
  // const [Longitude1, setLongitude1] = useState(113.00307)
  // const Latitude1: any = getCurrentInstance().router?.params.latitude;
  // const Longitude1: any = getCurrentInstance().router?.params.longitude;
  const [Regeocode, setRegeocode] = useState({})

  useEffect(() => {
    // AMapLoader.load({
    //   key: '3692bdb97a009ca2dd764fb707f1e913', // 申请好的Web端开发者Key，首次调用 load 时必填
    //   version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    //   plugins: ['AMap.DistrictSearch'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等 'AMap.DistrictSearch'
    // }).then((AMap) => {
    //   const district = new AMap.DistrictSearch({ subdistrict: 0, extensions: 'all', level: 'province' });
    //   district.search('郑州市', function (status, result) {
    //     // 查询成功时，result即为对应的行政区信息
    //     console.log(result.districtList[0].boundaries, 222) // 这里是整个郑州市的边界经纬度
    //     const bounds = result.districtList[0].boundaries
    //     const mask= [] as any[]
    //     for (let i = 0; i < bounds.length; i++) {
    //       mask.push([bounds[i]])
    //     }
    //     const map = new AMap.Map("container", {  // 设置地图容器id
    //       mask: mask, // 为Map实例制定掩模的路径,各图层将值显示路径范围内图像,3D模式下有效
    //       zoom: 10, // 设置当前显示级别
    //       expandZoomRange: true, // 开启显示范围设置
    //       zooms: [7, 20], //最小显示级别为7，最大显示级别为20
    //       center: [113.808299, 34.791787], // 设置地图中心点位置
    //       viewMode: "3D",    // 特别注意,设置为3D则其他地区不显示
    //       zoomEnable: true, // 是否可以缩放地图
    //       resizeEnable: true,
    //       /*mapStyle(地图的显示样式) 可以不写，默认是amap://styles/d6bf8c1d69cea9f5c696185ad4ac4c86
    //       目前支持两种地图样式： 第一种：自定义地图样式，如 "amap://styles/d6bf8c1d69cea9f5c696185ad4ac4c86"
    //       可前往地图自定义平台定制自己的个性地图样式； 第二种：官方样式模版,如"amap://styles/grey"。 其他模版样式及自定义地图的使用说明见开发指南*/
    //       // mapStyle: "amap://styles/d6bf8c1d69cea9f5c696185ad4ac4c86"
    //       // mapStyle: "amap://styles/grey"
    //       // mapStyle: "amap://styles/light"
    //     });
    //     // 添加描边
    //     for (let i = 0; i < bounds.length; i++) {
    //       const polyline = new AMap.Polyline({
    //         path: bounds[i], // polyline 路径，支持 lineString 和 MultiLineString
    //         strokeColor: '#3078AC', // 线条颜色，使用16进制颜色代码赋值。默认值为#00D3FC
    //         strokeWeight: 2, // 轮廓线宽度,默认为:2
    //         // map:map // 这种方式相当于: polyline.setMap(map);
    //       })
    //       polyline.setMap(map);
    //     }
    //   })
    // })
  }, [])


  const GetLocation = (e) => {
    // console.log("e", e)
    setDetail(e.nativeEvent)
    setLatitude(e.nativeEvent.position.latitude)
    setLongitude(e.nativeEvent.position.longitude)
  }


  const Submit = () => {
    const key = "3692bdb97a009ca2dd764fb707f1e913";   // 测试高德key
    fetch(`https://restapi.amap.com/v3/geocode/regeo?output=json&key=${key}&location=${Longitude},${Latitude}&extensions=base`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then((response) => response.json())
      .then((jsonData) => {
        console.log("jsonData", jsonData.regeocode)
        setRegeocode(jsonData.regeocode)
        Taro.navigateBack({ delta: 1 })
        Taro.eventCenter.trigger("Map", jsonData.regeocode);
      })
  }

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {/* <View style={{ backgroundColor: "#f7f8f8", margin: 10, }}>
        <Field placeholder="请输入地点搜索" style={{ height: 50, borderRadius: 5 }} onChange={(e) => onAdress(e)} />
      </View> */}
      <MapView
        mapType={MapType.Standard}
        initialCameraPosition={{
          target: {
            latitude: 28.21195380362908,
            longitude: 112.87741709450763,
          },
          zoom: 15
        }}
        labelsEnabled={true}
        myLocationButtonEnabled={true}
        // onLocation={nativeEvent => GetLocation(nativeEvent)}
        myLocationEnabled={true}
        onPress={(e) => console.log("onPress", e)}
        onPressPoi={(e) => GetLocation(e)}
        // ref={(e)=>console.log("e", e)}
      >
        <Marker
          position={{ latitude: Latitude, longitude: Longitude }}
          icon={require("@/assets/icons/dingwei.png")}
        >
        </Marker>
      </MapView>
      <Button type="primary" style={{ backgroundColor: "#4096ff" }} onClick={() => Submit()}> 确认</Button>
    </View >
  );
};

export default amap;
