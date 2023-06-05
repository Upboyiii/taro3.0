"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// @ts-ignore
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const ImagePicker = props => {
    const [bem] = (0, utils_1.createNamespace)("image-picker");
    const chooseFile = () => {
        const filePathName = process.env.TARO_ENV === "alipay" ? "apFilePaths" : "tempFiles";
        taro_1.default.chooseImage({
            count: props.maxCount,
            // @ts-ignore
            sizeType: props.sizeType,
            // @ts-ignore
            sourceType: props.sourceType,
            success: function (res) {
                // console.log(res,"res");
                const targetFiles = res.tempFilePaths.map((path, i) => ({
                    url: path,
                    file: res[filePathName][i]
                }));
                let newFiles = props.files.concat(targetFiles);
                if (props.maxCount && newFiles.length > props.maxCount) {
                    newFiles = newFiles.slice(0, props.maxCount);
                    taro_1.default.showToast({ title: `最多可上传${props.maxCount}张图片`, icon: "none" });
                }
                props.onChange(newFiles, "add");
            },
            fail: function (res) {
                props.onFail && props.onFail(res.errMsg);
            }
        });
    };
    const itemStyle = (0, react_1.useMemo)(() => {
        let style = {};
        if (props.files.length !== 0) {
            if (props.rowCount && props.rowCount > 0) {
                style.flexBasis = `${100 / props.rowCount}%`;
                style.paddingTop = `${100 / props.rowCount}%`;
            }
        }
        return style;
    }, [props.addRow, props.rowCount, props.files]);
    const previewImage = idx => {
        const currentImg = props.files[idx].url;
        taro_1.default.previewImage({
            current: currentImg,
            urls: props.files.map(file => {
                return file.url;
            })
        });
    };
    const handleImageClick = (idx) => {
        if (props.onImageClick) {
            props.onImageClick(idx, props.files[idx]);
        }
        else {
            props.preview && previewImage(idx);
        }
    };
    const handleRemove = (idx) => {
        const { files = [] } = props;
        if (process.env.TARO_ENV === "h5") {
            window.URL.revokeObjectURL(files[idx].url);
        }
        const newFiles = props.files.filter((_, i) => i !== idx);
        props.onChange(newFiles, "remove", idx);
    };
    const renderImages = () => {
        return props.files.map((file, idx) => {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("item")), style: itemStyle }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("preview")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("preview-image")), mode: props.mode, src: file.url, onClick: () => {
                                handleImageClick(idx);
                            } }), props.deletable ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("preview-remove")), onClick: () => {
                                handleRemove(idx);
                            } }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("preview-close"), "plus"), style: { width: (0, utils_1.addUnit)(10), height: (0, utils_1.addUnit)(10) } }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--v", style: { height: (0, utils_1.addUnit)(1.5), backgroundColor: "#fff" } }), (0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--h", style: { width: (0, utils_1.addUnit)(1.5), backgroundColor: "#fff" } })] })) }))) : null] })) }), idx));
        });
    };
    const renderButton = () => {
        // @ts-ignore
        if (props.showAdd && props.files.length < props.maxCount) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("item", { row: props.addRow && props.files.length === 0 })), style: itemStyle }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("button")), onClick: chooseFile, hoverStyle: { backgroundColor: "#f3f4f4" } }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("button-icon"), "plus") }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--v" }), (0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--h" })] })), props.addText ? (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("button-text")) }, { children: props.addText })) : null] })) })));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem(), props.className), style: props.style }, { children: [props.title ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title"), props.titleClass), style: props.titleStyle }, { children: props.title }))) : null, (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("content")) }, { children: [renderImages(), renderButton()] }))] })));
};
ImagePicker.defaultProps = {
    files: [],
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
    mode: "aspectFill",
    maxCount: 9,
    rowCount: 4,
    deletable: true,
    showAdd: true,
    addRow: false,
    addIcon: "camera"
};
exports.default = ImagePicker;
//# sourceMappingURL=index.js.map