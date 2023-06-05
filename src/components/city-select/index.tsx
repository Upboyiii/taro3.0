// @ts-ignore
import React, { FC, useState, useEffect, useMemo, Children } from "react";
import { View, ScrollView } from "@tarojs/components";
import { CitySelectProps } from "./PropsType";
import { createNamespace } from "../utils";
import { cityData } from "./cityDate";
import Popup from "@/components/popup";
import Radio from "@/components/radio";
import classnames from "classnames";
import "./index.scss";

let CountyArr = [] as any;

const CitySelect: FC<CitySelectProps> = props => {
  const [bem] = createNamespace("city-select");

  const [regionsTree, setRegionsTree] = useState<any[]>([]);
  const [regionsObj, setRegionsObj] = useState<any>({});
  const [regionsSelected, setRegionsSelected] = useState<any[]>([]);
  const [selectedObj, setSelectedObj] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [levelList, setLevelList] = useState<any[]>([]);

  const getRegionsPath = (county_id, regions_obj) => {
    let parents: any[] = [], id: string = county_id + "";
    let county_arr = [id.slice(0, 2).padEnd(6, "0"), id.slice(0, 4).padEnd(6, "0"), id];
    county_arr = Array.from(new Set(county_arr));
    const newArr = county_arr.map(Number);
    CountyArr = newArr;
    parents = county_arr
      .map(county => {
        return regions_obj[county];
      })
      .filter(item => !!item);
    // console.log(parents);
    return parents;
  };

  const regionsFormat = data => {
    if (data) {
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
      setRegionsTree(regions_tree);
      setRegionsObj(regions_obj);
      regions_obj = null;
      regions_tree = null as unknown as any[];
    }
  };

  useEffect(() => {
    regionsFormat(cityData);
  }, []);

  useEffect(() => {
    init();
  }, [regionsTree, regionsObj, props.value]);

  const init = () => {
    let children1 = [] as any;
    let children2 = [] as any;
    if (props.value && regionsObj) {
      let parents = getRegionsPath(props.value, regionsObj);
      let parents_len = parents.length;
      parents.forEach((item) => {
        item.children.forEach((item1) => {
          if (item1.id === CountyArr[1]) {
            children1.push(item1);
            item1.children.forEach((item2) => {
              if (item2.id === CountyArr[2]) {
                children2.push(item2);
              }
            })
          } else {
            if (item1.id === CountyArr[2]) {
              children2.push(item1)
            }
          }
        })
      })
      if (children1.length > 0) {
        parents.push(children1[0])
      }
      if (children2.length > 0) {
        parents.push(children2[0])
      }
      if (parents_len > 0) {
        // 如果数据不出错的情况下，这个判断也不需要，但是防止数据出错，放个兼容
        let temp = parents[parents_len - 1]; // parents_len > 0, temp肯定有值
        if (Array.isArray(temp?.children) && temp.children.length > 0) {
          setSelectedObj(null);
          setLevelList(children1.length > 0 ? children1[0].children : temp.children);
          setSelectedObj(children2.length > 0 ? children2[0] : "");
        } else {
          setSelectedObj(children2.length > 0 ? children2[0] : temp);
          temp = parents[parents_len - 2] || null;
          if (temp) {
            setLevelList(children1.length > 0 ? children1[0].children : temp.children);
          } else {
            setLevelList([...cityData]);
          }
        }
        setLevel(children1.length > 0 ? 3 : 2);
      } else {
        setLevel(3);
        setLevelList([...cityData]);
      }
      setRegionsSelected(parents);
    } else {
      setLevel(3);
      setLevelList([...cityData]);
    }
  };

  const handleCitySelected = item => {
    let temp_arr = [...regionsSelected];
    temp_arr.splice(item.level - 1, 3);
    setLevel(item.level);
    setRegionsSelected([...temp_arr, item]);
    if ("children" in item && item.children.length > 0) {
      setLevelList([...item.children]);
      setSelectedObj(null);
    } else {
      setSelectedObj(item);
      if (!props.showConfirm) {
        props.onConfirm && props.onConfirm([...temp_arr, item]);
        handleClose();
      }
    }
  };

  const handleLevel = item => {
    if (item) {
      if (item.level === 1) {
        setLevelList([...cityData]);
      } else if (item.level === 2) {
        let temp: any = regionsSelected[0];
        setLevelList([...temp.children]);
      } else if (item.level === 3) {
        let temp: any = regionsSelected[1];
        setLevelList([...temp.children]);
      }
      setLevel(item.level);
      setSelectedObj(item);
    } else {
      let len = regionsSelected.length;
      if (len === 0) {
        setLevelList([...cityData]);
      } else {
        let temp: any = regionsSelected[len - 1];
        setLevelList([...temp.children]);
      }
      setSelectedObj(null);
    }
  };

  const handleClose = (reset = false) => {
    console.log("取消");
    props.onCancel && props.onCancel();
    if (reset) {
      init();
    }
  };

  const handleConfirm = () => {
    props.onConfirm && props.onConfirm([...regionsSelected]);
    handleClose();
  };


  return (
    <Popup
      show={props.show}
      closeable={false}
      onClose={() => { handleClose(true); }}
      scroll={false}
      customStyle={{ backgroundColor: "#f7f8f8" }}
    >
      <View className={classnames(bem(), props.className)} style={props.style}>
        <View className={classnames(bem("header"))}>
          <View className={classnames(bem("btn", "cancel"))} onClick={() => { handleClose(false); }}>取消</View>
          <View className={classnames(bem("title"))}>{props.title || "请选择地区"}</View>
          {props.showConfirm && <View className={classnames(bem("btn", "confirm"))} onClick={handleConfirm}>确定</View>}
        </View>
        <View className={classnames(bem("main"))}>
          <View className={classnames(bem("selected"))}>
            {regionsSelected.map((item: any) => {
              return (
                <View
                  key={item.id}
                  className={classnames(bem("selected-item", { active: ((selectedObj as any) ?? {}).id === item.id }))}
                  onClick={() => handleLevel(item)}
                >
                  {((selectedObj as any) ?? {}).id === item.id && <View className={classnames(bem("selected-active"))} />}
                  {item.label}
                </View>
              );
            })}
            {regionsSelected.length === 0 || "children" in (regionsSelected[regionsSelected.length - 1] ?? {}) ? (
              <View
                className={classnames(bem("selected-item", { active: regionsSelected.length === 0 || !selectedObj }))}
                onClick={() => handleLevel(null)}
              >
                {(regionsSelected.length === 0 || !selectedObj) && <View className={classnames(bem("selected-active"))} />}
                请选择
              </View>
            ) : null}
          </View>
          {regionsTree.length > 0 ? (
            <ScrollView className={classnames(bem("list"))} scrollWithAnimation scrollY>
              {levelList.map((item, index) => {
                return (
                  <Radio
                    key={`item-${item.id}`}
                    border={index !== 0}
                    cell
                    type="check"
                    label={item.label}
                    labelStyle={(regionsSelected[level - 1] as any)?.id === item.id ? { color: "#ff2340" } : {}}
                    checked={(regionsSelected[level - 1] as any)?.id === item.id}
                    onClick={() => handleCitySelected(item)}
                  />
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Popup>
  );
};

CitySelect.defaultProps = {

};

export default CitySelect;
