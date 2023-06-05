// @ts-ignore
import React, { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { ImagePickerProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { base } from "@/api/config";

const ImagePicker: FC<ImagePickerProps> = props => {
  const [bem] = createNamespace("image-picker");

  const [files,setFiles] = useState<any[]>([]);

  useEffect(()=>{
    if(props.files){
      // @ts-ignore
      setFiles(()=>{
        return [...props.files];
      });
    }else {
      setFiles([]);
    }
  },[props.files]);

  useEffect(()=>{
    // console.log(props.refs, "props.refs");
    let parms = props.refs ? props.refs : "materialChange";
    eventCenterOn(parms,(res)=>{
      const msg = res[0];
      setFiles(prv=>{
        let list = [...prv,...msg];
        // @ts-ignore
        props.onChange && props.onChange(list);
        return list;
      });
    });
    return () => {
      eventCenterOff(parms);
    };
  },[]);

  const chooseFile = () => {
    navigateTo({
      method:"navigateTo",
      url:"/pages/shop/material/index",
      params:{
        // files: files,
        max: (props?.maxCount || 999) - files.length,
        refs: props.refs ? props.refs : "materialChange"
      }
    });
  };

  const itemStyle = useMemo(() => {
    let style: CSSProperties = {};
    if (!props.addRow) {
      if (props.rowCount && props.rowCount > 0) {
        style.flexBasis = `${100 / props.rowCount}%`;
        style.paddingTop = `${100 / props.rowCount}%`;
      }
    }
    return style;
  }, [props.addRow, props.rowCount, props.files]);

  const previewImage = idx => {
    const currentImg = base.file_host + "/" + files[idx];
    Taro.previewImage({
      current: currentImg,
      urls: files.map(file => {
        return base.file_host + "/" + file;
      })
    });
  };
  const handleImageClick = (idx: number): void => {
    if (props.onImageClick) {
      props.onImageClick(idx, files[idx]);
    } else {
      props.preview && previewImage(idx);
    }
  };
  const handleRemove = (idx: number): void => {
    const { files = [] } = props;
    if (process.env.TARO_ENV === "h5") {
      // @ts-ignore
      window.URL.revokeObjectURL(files[idx]);
    }
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(():any=>{
        props.onChange(newFiles, "remove", idx);
      return [...newFiles];
    });

  };

  const renderImages = () => {
    return files.map((file, idx) => {
      return (
        <View key={idx} className={classnames(bem("item"))} style={itemStyle}>
          <View className={classnames(bem("preview"))}>
            <Image
              className={classnames(bem("preview-image"))}
              mode={props.mode}
              src={base.file_host + "/" + file}
              onClick={() => {
                handleImageClick(idx);
              }}
            />
            {props.deletable ? (
              <View
                className={classnames(bem("preview-remove"))}
                onClick={() => {
                  handleRemove(idx);
                }}
              >
                <View className={classnames(bem("preview-close"), "plus")} style={{ width: addUnit(10), height: addUnit(10) }}>
                  <View className="plus-item plus-item--v" style={{ height: addUnit(1.5), backgroundColor: "#fff" }} />
                  <View className="plus-item plus-item--h" style={{ width: addUnit(1.5), backgroundColor: "#fff" }} />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      );
    });
  };

  const renderButton = () => {
    // @ts-ignore
    if (props.showAdd && files.length < props.maxCount) {
      return (
        <View className={classnames(bem("item", { row: props.addRow && files.length === 0 }))} style={itemStyle}>
          <View className={classnames(bem("button"))} onClick={chooseFile} hoverStyle={{ backgroundColor: "#f3f4f4" }}>
            <View className={classnames(bem("button-icon"), "plus")}>
              <View className="plus-item plus-item--v" />
              <View className="plus-item plus-item--h" />
            </View>
            {props.addText ? <View className={classnames(bem("button-text"))}>{props.addText}</View> : null}
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View className={classnames(bem(), props.className)} style={props.style}>
      {props.title ? (
        <View className={classnames(bem("title"),props.titleClass)} style={props.titleStyle}>{props.title}</View>
      ) : null}
      <View className={classnames(bem("content"))}>
        {renderImages()}
        {renderButton()}
      </View>
    </View>
  );
};

ImagePicker.defaultProps = {
  refs:"",
  files: [],
  sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
  sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
  mode: "aspectFill",
  maxCount: 9,
  rowCount: 4,
  deletable: true,
  showAdd: true,
  addRow: false,
  addIcon: "camera"
};

export default ImagePicker;
