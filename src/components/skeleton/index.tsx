import React, { CSSProperties, FC } from "react";
import { View } from "@tarojs/components";
import { SkeletonProps } from "./PropsType";
import { addUnit, createNamespace } from "@/components/utils";
import classnames from "classnames";
import "./index.scss";

const Skeleton: FC<SkeletonProps> = props => {
  const [bem] = createNamespace("skeleton");

  const getSizeStyle = origin => {
    if (!!origin) {
      if (Array.isArray(origin)) {
        return {
          width: origin[0],
          height: origin[1]
        };
      } else {
        return {
          width: origin,
          height: origin
        };
      }
    }
    return {};
  };
  const renderImage = () => {
    let styles: CSSProperties = { ...getSizeStyle(props.imageSize) };
    if (props.spacing) {
      if (props.direction === "column") {
        styles.marginBottom = props.spacing;
      } else {
        styles.marginRight = props.spacing;
      }
    }
    if (!props.title && !props.row) {
      styles.margin = 0;
    }
    if (props.color) {
      styles.backgroundColor = props.color;
    }
    if (props.image) {
      return (
        <View
          className={classnames(
            bem("image", {
              [`${props.imageShape}`]: props.imageShape,
              [`${props.direction}`]: props.direction,
              [`animate-${props.animate}`]: props.animate
            })
          )}
          style={styles}
        />
      );
    }
    return null;
  };

  const renderTitle = () => {
    let styles: CSSProperties = { ...getSizeStyle(props.titleSize) };
    if (props.color) {
      styles.backgroundColor = props.color;
    }
    if (props.title) {
      return (
        <View
          className={classnames(
            bem("title", {
              round: props.round,
              [`animate-${props.animate}`]: props.animate
            })
          )}
          style={styles}
        />
      );
    }
    return null;
  };

  const renderRows = () => {
    if (props.row) {
      const rowArray = Array.apply(null, Array(props.row)).map((_, index) => index);
      const Rows = rowArray.map((item, index) => {
        let style: CSSProperties = { };
        if (!!props.rowWidth) {
          if (Array.isArray(props.rowWidth)){
            if (props.rowWidth[index]) {
              style.width = props.rowWidth[index];
            }else{
              style.width = +props.rowWidth;
            }
          }else{
            style.width = +props.rowWidth;
          }
        }
        if (!!props.rowHeight) {
          if (Array.isArray(props.rowHeight)){
            if (props.rowHeight[index]) {
              style.height = props.rowHeight[index];
            }else{
              style.height = +props.rowHeight;
            }
          }else{
            style.height = +props.rowHeight;
          }
        }
        if (props.spacing) {
          if (props.direction === "column") {
            style.marginLeft = props.spacing;
          } else {
            style.marginTop = props.spacing;
          }
        }
        if (!props.title && index === 0) {
          if (props.rowsDirection === "row") {
            style.marginLeft = 0;
          } else {
            style.marginTop = 0;
          }
        }
        if (props.color) {
          style.backgroundColor = props.color;
        }
        return (
          <View
            key={item}
            className={classnames(
              bem("row", {
                round: props.round,
                [`${props.rowsDirection}`]: props.rowsDirection,
                [`animate-${props.animate}`]: props.animate
              })
            )}
            style={style}
          />
        );
      });
      return (
        <View
          className={classnames(
            bem("rows", {
              [`${props.rowsDirection}`]: props.rowsDirection,
              [`${props.rowsDirection}-${props.rowsAlign}`]: props.rowsDirection && props.rowsAlign
            })
          )}
        >
          {Rows}
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (props.title || props.row) {
      return (
        <View
          className={classnames(
            bem("content", {
              [`${props.contentDirection}`]: props.contentDirection,
              [`${props.contentDirection}-${props.contentAlign}`]: props.contentDirection && props.contentAlign
            })
          )}
        >
          {renderTitle()}
          {renderRows()}
        </View>
      );
    }
    return null;
  };

  const renderAction = () => {
    let style: CSSProperties = { ...getSizeStyle(props.actionSize) };
    if (props.spacing) {
      if (props.direction === "column") {
        style.marginTop = addUnit(props.spacing);
      } else {
        style.marginLeft = addUnit(props.spacing);
      }
    }
    if (props.color) {
      style.backgroundColor = props.color;
    }
    if (props.action) {
      return (
        <View
          className={classnames(
            bem("action", {
              round: props.round || props.actionRound,
              [`${props.direction}`]: props.direction,
              [`animate-${props.animate}`]: props.animate
            })
          )}
          style={style}
        />
      );
    }
    return null;
  };

  return (
    <React.Fragment>
      {!props.loading ? (
        props.children
      ) : (
        <View
          className={classnames(
            props.className,
            bem({
              card: props.card,
              compact: props.compact,
              [`${props.direction}`]: props.direction,
              [`${props.align}`]: props.align
            })
          )}
          style={props.style}
        >
          {props.border ? <View className={classnames(bem("border"))} /> : null}
          {renderImage()}
          {renderContent()}
          {renderAction()}
        </View>
      )}
    </React.Fragment>
  );
};

Skeleton.defaultProps = {
  loading: true,
  animate: "breathe",
  direction: "row",
  align: "center",
  imageShape: "square",
  rowsDirection: "column",
  contentDirection: "column",
  contentAlign: "left"
};

export default Skeleton;
