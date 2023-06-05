import React, { FC, useMemo } from "react";
import { View } from "@tarojs/components";
import { createNamespace , addUnit, getSizeStyle } from "../utils";
import { LoadingProps } from "./PropsType";
import classnames from "classnames";
import "./index.scss";

const CircularIcon = ({ bem }) => (
  <React.Fragment>
    {Array(3)
      .fill(null)
      .map((_, index) => (
        <View key={index} className={classnames(bem("ring", String(index + 1)))} />
      ))}
  </React.Fragment>
);

const SpinIcon = ({ bem }) => (
  <React.Fragment>
    {Array(12)
      .fill(null)
      .map((_, i) => (
        <View
          key={i}
          className={classnames(bem("line", String(i + 1)))}
          style={{
            opacity: 1 / 12 * i,
            transform: `rotate(${i * 30}deg)`
          }}
        />
      ))}
  </React.Fragment>
);

const BallIcon = ({ bem }) => (
  <React.Fragment>
    {Array(3)
      .fill(null)
      .map((_, index) => (
        <View key={index} className={classnames(bem("dot", String(index + 1)))} />
      ))}
  </React.Fragment>
);

const WellIcon = ({ bem }) => (
  <View className={classnames(bem("well"))} />
);

const Icon = (bem) => ({
  spinner: <SpinIcon bem={bem} />,
  circular: <CircularIcon bem={bem} />,
  ball: <BallIcon bem={bem} />,
  well: <WellIcon bem={bem} />
});

const Loading: FC<LoadingProps> = props => {
  const [bem] = createNamespace("loading");
  const { className, type, vertical, color, size, children, text, textSize, textColor } = props;
  const spinnerStyle = useMemo(
    () => ({
      color: color,
      ...getSizeStyle(size)
    }),
    [color, size]
  );

  const renderText = () => {
    if (children || text) {
      return (
        <span
          className={classnames(bem("text", { vertical }))}
          style={{
            fontSize: addUnit(textSize),
            color: textColor ?? color
          }}
        >
          {children || text}
        </span>
      );
    }
    return null;
  };

  return (
    <View
      className={classnames(className, bem([type, { vertical }]))}
      style={props.style}
    >
      <View className={classnames(bem("spinner", type))} style={spinnerStyle}>
        {// @ts-ignore
          Icon(bem)[type]
        }
      </View>
      {renderText()}
    </View>
  );
};

Loading.defaultProps = {
  type: "circular"
};

export default Loading;


