import React, { FC, useEffect, useState } from "react";
import { View, Image } from "@tarojs/components";
import Taro, {  useRouter } from "@tarojs/taro";
import { filesApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { addUnit } from "@/components/utils";
import ScrollView from "@/components/scroll-view";
import Dropdown from "@/components/dropdown";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Checkbox from "@/components/checkbox";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const Material: FC = () => {
  const route = useRouter();
  const max = route?.params?.max || "1";
  const type = route?.params?.type || "1";
  const files = route?.params?.files || "[]";

  const fileTypeList = ["图片","音频","视频"];

  const pageSize = 40;
  const [err, setErr] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [groupID, setGroupID] = useState<number>(-1);
  const [isPage, setIsPage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any>([]);
  const [fileMax, setFileMax] = useState<number>(3);
  const [fileType, setFileType] = useState<number>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [disabled, setDisabled] = useState([]);

  const [groupList, setGroupList] = useState<any>([]);
  const getGorupList = () => {
    setGroupID(-1);
    filesApi.group.page({ page: 1, page_size: 999, file_type: fileType }).then(res => {
      if (!!res && res.code === 0) {
        const list = res.data?.list || [];
        setGroupList([{
          id: -1,
          name: "未分组"
        }, ...list]);
      }
    });
  };
  useEffect(()=>{
    if(!!files && !!JSON.parse(files)){
      setSelected(JSON.parse(files));
    }
    if(!!max && !Number.isNaN(Number(max))){
      setFileMax(parseInt(max));
    }
    if(!!type && !Number.isNaN(Number(type))){
      Taro.setNavigationBarTitle({ title: fileTypeList[parseInt(type) - 1] + "素材中心" });
      setFileType(parseInt(type));
    }
    getGorupList();
  },[]);

  useEffect(()=>{
    getFileList(page, groupID,true);
  },[groupID, fileType]);

  const getFileList = (page, group_id, refresh = false) => {
    if(refresh){
      setPage(1);
      setTotal(0);
      setFileList([]);
      setLoading(true);
      setIsPage(true);
    }
    filesApi.file.page({ page, group_id, page_size: pageSize, file_type: fileType }).then(res => {
      if (!!res && res.code === 0) {
        setTotal(res.data.total || 0);
        if (page * pageSize > res.data.total) {
          setIsPage(false);
        }
        let list = res.data.list ? res.data.list : [];
        setFileList(prv => {
          return [...prv, ...list];
        });
      } else {
        setErr(true);
      }
    }).catch(() => {
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
      setPulling(false);
    });
  };

  const handleChange = (val, pic) =>{
    setSelected(prevState => {
      let _selected = fileMax !== 1 ? JSON.parse(JSON.stringify(prevState)) : [];
      if(val){
        if(_selected.indexOf(pic) === -1){
          _selected.push(pic);
        }
      }else{
        if(_selected.indexOf(pic) > -1){
          _selected.splice(_selected.indexOf(pic),1);
        }
      }
      if(fileMax !== 1){
        if(_selected.length >= fileMax){
          let _disabled:any = [];
          fileList.map((item,idx)=>{
            _disabled[idx] = _selected.indexOf(`${item.path}/${item.id}.${item.tag}`) === -1;
          });
          setDisabled(_disabled);
        }else{
          setDisabled([]);
        }
      }
      return _selected;
    });
  };

  const onScrollToLower = () => {
    if (isPage && (fileMax === 1 || (fileMax > 1 && selected.length < fileMax))) {
      setPulling(true);
      setPage((prv) => {
        let page = prv + 1;
        getFileList(page,groupID);
        return page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getFileList(1, groupID,true);
    },500);
  };

  const saveClick = ()=>{
    if(selected.length <= 0){
      Taro.showToast({ title:"请选择文件",icon:"none" });
      return;
    }

    // console.log(selected,"selected");

    const materialChange = route?.params?.refs ? route?.params?.refs : "materialChange";
    eventCenterTrigger(materialChange,selected);
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex:1, backgroundColor: "#f7f8f8" }}>
      {groupList.length > 1 ? (
        <Dropdown border="top-bottom">
          <Dropdown.item
            title="未分组"
            value={groupID}
            options={groupList}
            format={{ label: "name", value: "id" }}
            onChange={(val)=>{
              setPage(1);
              setGroupID(val);
            }}
          />
        </Dropdown>
      ) : null}
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        pullUp={!loading}
        loading={pulling}
        loadMore={total > pageSize && (fileMax === 1 || (fileMax > 1 && selected.length < fileMax))}
        loadStart={total > page * pageSize}
        onPullUp={onScrollToLower}
      >
        {!loading ? (
          <React.Fragment>
            {fileList.length > 0 ? (
              <React.Fragment>
                {fileType === 2 ? (
                  <React.Fragment>
                    {fileList.map((item, index) => {
                      return(
                        <Checkbox
                          key={`file_${item.id || index}`}
                          style={{ backgroundColor: "#fff" }}
                          cell
                          label={item.name}
                          labelPosition="right"
                          disabled={disabled[index]}
                          checked={selected.indexOf(`${item.path}/${item.id}.${item.tag}`) > -1}
                          onChange={(val)=>{
                            handleChange(val, `${item.path}/${item.id}.${item.tag}`);
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <View className={classnames("material-group")}>
                    {fileList.map((item, index) => {
                      return(
                        <View
                          key={`file_${item.id || index}`}
                          className={classnames("material-item")}
                        >
                          <Checkbox
                            className={classnames("material-checkbox",{ "material-checkbox--disabled": disabled[index] })}
                            contentStyle={{ flex: 1, paddingLeft: 0 }}
                            iconStyle={{
                              position: "absolute",
                              zIndex: 3,
                              top: 5,
                              right: 5,
                              opacity: disabled[index] ? 0 : 1
                            }}
                            disabled={disabled[index]}
                            checked={selected.indexOf(`${item.path}/${item.id}.${item.tag}`) > -1}
                            onChange={(val)=>{
                              handleChange(val, `${item.path}/${item.id}.${item.tag}`);
                            }}
                          >
                            <Image
                              className={classnames("material-image")}
                              src={`${base.file_host}/${item.path}/${item.id}.${item.tag}?${fileType === 3 ? "300x300" : "100x100"}`}
                              mode="aspectFill"
                            />
                          </Checkbox>
                        </View>
                      );
                    })}
                  </View>
                )}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关素材" />
            )}
          </React.Fragment>
        ) : (
          <View className={classnames("material-group")}>
            {Array(20)
              .fill("")
              .map((_, i) => {
                return (
                  <View className={classnames("material-item")} key={i}>
                    <View
                      className={classnames("material-checkbox")}
                      style={{ backgroundColor: "#fff" }}
                    />
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ flex: 1, marginRight: addUnit(12) }}
          type="success"
          onClick={()=>{
            Taro.chooseImage({
              count: fileMax, // 默认9
              sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
              sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
              success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths;
                console.log(tempFilePaths,"tempFilePaths");
              }
            });
          }}
        >
          上传素材
        </Button>
        <Button
          style={{ flex: 1 }}
          type="info"
          onClick={saveClick}
        >
          {`确定(${selected.length})`}
        </Button>
      </BottomBar>
    </View>
  );
};
export default Material;
