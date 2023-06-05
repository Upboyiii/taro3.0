import React, { CSSProperties, FC, useEffect, useState } from "react";
import { View, ScrollView } from "@tarojs/components";
import { Text } from "react-native";
import { createNamespace } from "../utils";
import { DropdownProps, DropdownMenuProps, DropdownOptionItem } from "./PropsType";
import classnames from "classnames";
import Radio from "@/components/radio";
import "./index.scss";

const Dropdown: FC<DropdownProps> = props => {
  const [bem] = createNamespace("dropdown");

  const [itemShow, setItemShow] = useState<boolean[]>([]);
  const [itemTitle, setItemTitle] = useState<string[]>([]);
  const [overlay, setOverlay] = useState(false);

  const toggleItemShow = (index: number) => {
    setOverlay(!itemShow[index]);
    itemShow[index] = !itemShow[index];
    const temp = itemShow.map((i: boolean, idx) => (idx === index ? i : false));
    setItemShow([...temp]);
  };
  // const hideItemShow = (index: number) => {
  //   setOverlay(false);
  //   if(process.env.TARO_ENV === "rn"){
  //     itemShow[index] = false;
  //     setItemShow([...itemShow]);
  //   }else{
  //     setItemShow(prevState => {
  //       let temp = JSON.parse(JSON.stringify(prevState));
  //       itemShow[index] = false;
  //       return temp;
  //     });
  //   }
  // };
  const updateTitle = (text: string, index: number) => {
    itemTitle[index] = text;
    setItemTitle([...itemTitle]);
  };

  const cloneChildren = () => {
    return React.Children.map(props.children, (child, index) => {
      if(!child) return null;
      return React.cloneElement(child as any, {
        show: itemShow[index],
        orderKey: index,
        zIndex: props.zIndex,
        height: props.height,
        parent: {
          toggleItemShow,
          updateTitle
          // hideItemShow
        }
      });
    });
  };

  const renderBorder = () => {
    if(!!props.border){
      return (
        <React.Fragment>
          {props.border === "top" || props.border === "top-bottom" ? <View className={classnames(bem("border","top"), "hairline","hairline--top")} /> : null}
          {props.border === "bottom" || props.border === "top-bottom" ? <View className={classnames(bem("border","bottom"), "hairline","hairline--bottom")} /> : null}
        </React.Fragment>
      );
    }
    return null;
  };

  const renderBar = () => {
    if(!props.prefix && !props.suffix && (!props.children || React.Children.toArray(props.children).length === 0)) return null;
    return (
      <React.Fragment>
        {props.prefix ? props.prefix : null}
        {props.children && React.Children.toArray(props.children).length > 0 ? (
          <React.Fragment>
            {React.Children.toArray(props.children).map((child, index) => {
              if (!child) return null;
              const { disabled, title, titleAlter, value, options, format, onClick, className, style } = (child as any).props as any;
              const currentTitle = options?.filter((option: DropdownOptionItem) => {
                return option[format.value] === value;
              });
              function finallyTitle() {
                if (title && !titleAlter) return title;
                if (itemTitle && itemTitle[index]) return itemTitle[index];
                if (currentTitle && currentTitle[0] && currentTitle[0][format.label]) return currentTitle[0][format.label];
                return "";
              }
              return (
                <View
                  key={`dropdown-menu${index}`}
                  className={classnames(bem("menu", { disabled, active: itemShow[index], scroll: props.scroll }), className)}
                  style={style}
                  onClick={() => {
                    !disabled && toggleItemShow(index);
                    onClick && onClick();
                  }}
                >
                  {/* @ts-ignore*/}
                  <Text className={classnames(bem("menu-title", { disabled, active: itemShow[index] }))} numberOfLines={1}>{finallyTitle()}</Text>
                  <View className={classnames(bem("menu-arrow", { disabled, active: itemShow[index] }))} />
                </View>
              );
            })}
          </React.Fragment>
        ) : null}
        {props.suffix ? props.suffix : null}
      </React.Fragment>
    );
  };

  return (
    <View className={classnames(bem(), props.className)} style={{ zIndex: props.zIndex }}>
      {props.overlay && overlay ? (
        <View
          className={classnames(bem("overlay"))}
          onClick={()=>{
            if(props.closeOnClickOverlay){
              setItemShow([]);
              setOverlay(false);
            }
          }}
        />
      ) : null}
      {props.scroll ? (
        <View className={classnames(bem("bar"))} style={props.style}>
          {renderBorder()}
          <ScrollView className={classnames(bem("scroll"))} scrollX>
            {renderBar()}
          </ScrollView>
        </View>
      ) : (
        <View className={classnames(bem("bar"))} style={props.style}>
          {renderBorder()}
          {renderBar()}
        </View>
      )}
      {cloneChildren()}
    </View>
  );
};
Dropdown.defaultProps = {
  border: "bottom",
  zIndex: 80,
  overlay: true,
  closeOnClickOverlay: true
};

const DropdownMenu: FC<DropdownMenuProps> = props => {
  const [bem] = createNamespace("dropdown-item");

  const { show, parent, orderKey, zIndex, height } = props as any;

  const [_value, setValue] = useState(props.value);
  const [_active, setActive] = useState(props.menuValue || 0);
  const [_index, setIndex] = useState(0);
  const [_children, setChildren] = useState<any>([]);

  useEffect(()=>{
    if(!!props.options && props.options.length > 0 && props.hasChildren){
      let index = _index;
      if(props.menuValue !== undefined){
        index = props.options.findIndex(item=>props.menuValue === item[props.format?.value ?? "value"]);
      }
      if(!!props.options[index]?.children && props.options[index].children.length > 0){
        setChildren(props.options[index]?.children);
        props.options[index].children.forEach(item=>{
          if(props.value === item[props.format?.value ?? "value"]){
            setTitle(item[props.format?.label ?? "label"]);
            setValue(item[props.format?.value ?? "value"]);
            // setActive(item[props.format?.value ?? "value"]);
          }
        });
      }else{
        setChildren([]);
        setTitle(props.options[index][props.format?.label ?? "label"]);
      }
    }
  },[props.hasChildren, props.options]);

  const setTitle = (text: string) => {
    parent.updateTitle(text, orderKey);
  };
  const handleClick = (item) => {
    parent.toggleItemShow(orderKey);
    setTitle(item[props.format?.label ?? "label"]);
    setValue(item[props.format?.value ?? "value"]);
    props.onChange && props.onChange(item[props.format?.value ?? "value"]);
  };

  if(!show) return null;

  const renderList = (options) => {
    if(!!options && options.length > 0){
      if(!!props.columns && props.columns > 1){
        return (
          <View className={classnames(bem("tags"))}>
            {options.map((item, index)=>{
              return (
                <React.Fragment key={`dropdown-item-${index}`}>
                  <View
                    className={classnames(bem("tag-wrapper"))}
                    style={{ flexBasis: `${100 / (props.columns || 2)}%` }}
                  >
                    <View
                      className={classnames(bem("tag", { active: _value === item[props.format?.value ?? "value"] }))}
                      onClick={() => {
                        handleClick(item);
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        // @ts-ignore
                        className={classnames(
                          bem("tag-text",{
                            active: _value === item[props.format?.value ?? "value"]
                          })
                        )}
                      >
                        {item[props.format?.label ?? "label"]}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        );
      }else{
        return options.map((item, index)=>{
          return (
            <React.Fragment key={`dropdown-item-${index}`}>
              <Radio
                border={index !== 0}
                cell
                type="check"
                label={item[props.format?.label ?? "label"]}
                labelStyle={{ color: _value === item[props.format?.value ?? "value"] ? "#ff2340" : "#333" }}
                value={item[props.format?.value ?? "value"]}
                checked={_value === item[props.format?.value ?? "value"]}
                onClick={() => {
                  handleClick(item);
                }}
              />
            </React.Fragment>
          );
        });
      }
    }
    return null;
  };

  const renderContent = () => {
    if(props.scroll){
      return (
        <ScrollView
          style={{ width: "100%", height: "100%" }}
          scrollWithAnimation
          scrollY
        >
          {renderList(props.options)}
        </ScrollView>
      );
    }else{
      return renderList(props.options);
    }
  };

  const renderAside = () => {
    if(!!props.options && props.options.length > 0){
      return (
        <View className={classnames(bem("aside"))}>
          <ScrollView style={{ height: "100%" }} scrollWithAnimation scrollY>
            {props.options.map((item, index)=>{
              return (
                <React.Fragment key={`dropdown-aside-${index}`}>
                  <View
                    className={classnames(
                      bem("aside-item",{
                        active: _active === item[props.format?.value ?? "value"]
                      })
                    )}
                    onClick={()=>{
                      if(_active === item[props.format?.value ?? "value"]) return;
                      setIndex(index);
                      setActive(item[props.format?.value ?? "value"]);
                      if(!!item.children && item.children.length > 0){
                        setValue(null);
                        setChildren(item.children);
                      }else{
                        setChildren([]);
                        handleClick(item);
                        props.onMenuChange && props.onMenuChange(item[props.format?.value ?? "value"]);
                      }
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      // @ts-ignore
                      className={classnames(
                        bem("aside-text",{
                          active: _active === item[props.format?.value ?? "value"]
                        })
                      )}
                    >
                      {item[props.format?.label ?? "label"]}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>
      );
    }
    return null;
  };

  const renderChildren = () => {
    if(!!_children && _children.length > 0){
      return (
        <View className={classnames(bem("main"))}>
          <ScrollView style={{ height: "100%" }} scrollWithAnimation scrollY>
            {renderList(_children)}
          </ScrollView>
        </View>
      );
    }
    return null;
  };

  let styles: CSSProperties = { zIndex: zIndex + 1 };
  if (props.itemHeight || height) {
    styles.height = props.itemHeight || height;
  }

  return (
    <View
      className={classnames(bem({ row: props.hasChildren }))}
      style={styles}
    >
      {props.hasChildren ? (
        <React.Fragment>
          {renderAside()}
          {renderChildren()}
        </React.Fragment>
      ) : renderContent()}
    </View>
  );
};
DropdownMenu.defaultProps = {
  titleAlter: true,
  columns: 1,
  format: {
    label: "label",
    value: "value"
  }
};

const OwlDropdown = Object.assign(Dropdown, { item: DropdownMenu });
export default OwlDropdown;
