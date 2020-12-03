/* eslint-disable */
import Root from "./Root";
import Matrix from "../math/Matrix";
import CoordinateSystem from "../math/geometry/base/CoordinateSystem";

const AlignMatrixStrategies = {
    "left-top" () {
        return Matrix.init(3);
    },
    "horizontal-left"(containerSize,innerSize) {
        let {
            height
        } = containerSize;
        let {
            height: _height
        } = innerSize;
        let ratio = height / _height;
        let m = Matrix.scale(ratio,ratio);
        return m;
    },
    "horizontal-center"(containerSize,innerSize) {
        let {
            width,height
        } = containerSize;
        let {
            width: _width,height: _height
        } = innerSize;
        let ratio = height / _height;
        let __width = ratio * _width;
        let delta = (width - __width) / 2;
        let m = Matrix.scale(ratio,ratio);
        let translateMatrix = Matrix.translate(delta,0);
        return m.multiply(translateMatrix);
    },
    "horizontal-right"(containerSize,innerSize) {
        let {
            width,height
        } = containerSize;
        let {
            width: _width,height: _height
        } = innerSize;
        let ratio = height / _height;
        let __width = ratio * _width;
        let delta = width - __width;
        let m = Matrix.scale(ratio,ratio);
        let translateMatrix = Matrix.translate(delta,0);
        return m.multiply(translateMatrix);
    },
    "vertical-top"(containerSize,innerSize) {
        let {
            width
        } = containerSize;
        let {
            width: _width
        } = innerSize;
        let ratio = width / _width;
        let m = Matrix.scale(ratio,ratio);
        return m;
    },
    "vertical-center"(containerSize,innerSize) {
        let {
            width,height
        } = containerSize;
        let {
            width: _width,height: _height
        } = innerSize;
        let ratio = width / _width;
        let __height = ratio * _height;
        let delta = (height - __height) / 2;
        let m = Matrix.scale(ratio,ratio);
        let translateMatrix = Matrix.translate(0,delta);
        return m.multiply(translateMatrix);
    },
    "vertical-bottom"(containerSize,innerSize) {
        let {
            width,height
        } = containerSize;
        let {
            width: _width,height: _height
        } = innerSize;
        let ratio = width / _width;
        let __height = ratio * _height;
        let delta = height - __height;
        let m = Matrix.scale(ratio,ratio);
        let translateMatrix = Matrix.translate(0,delta);
        return m.multiply(translateMatrix);
    }
};

function automaticCalculateAlignType(containerSize,innerSize) {
    let {
        width,height
    } = containerSize;
    let {
        width: _width,height: _height
    } = innerSize;
    let aspectRatio = width / height;
    let innerAspectRatio = _width / _height;
    if (aspectRatio >= innerAspectRatio) {
        return "horizontal-center";
    }
    return "vertical-top";
}

class Layer {
    constructor(props, mode, containerSize) {
        if (props instanceof Root) {
            this.root = props;
        } else {
            this.root = new Root(props);
        }
        //图层对齐方式: left-top;horizontal-left,horizontal-center,horizontal-right;vertical-top,vertical-center,vertical-bottom;
        this.align = automaticCalculateAlignType(containerSize, this.root.getSize());
        this.mode = mode;
        this.containerSize = {};
        this.setContainerSize(containerSize);
        this.updateMatrix();
        this.coord = new CoordinateSystem(this.matrix);
        switch (this.mode) {
            case "svg": {
                this.useSVGMode();
                break;
            }
            case "canvas": {
                this.useCanvasMode();
                break;
            }
        }
    }

    setContainerSize({width,height}) {
        this.containerSize.width = width;
        this.containerSize.height = height;
    }

    updateMatrix() {
        this.matrix = AlignMatrixStrategies[this.align](this.containerSize, this.root.getSize());
    }

    useSVGMode() {
        this.mode = "svg";
        if (this.dom && this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
        this.dom = document.createElementNS("http://www.w3.org/2000/svg","svg");
    }

    useCanvasMode() {
        this.mode = "canvas";
        if (this.dom && this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
        this.dom = document.createElement("canvas");
    }

    setContentSize({width,height}) {
        this.root.setSize({width,height});
    }

    setAlign(align) {
        if (AlignMatrixStrategies[align]) {
            this.align = align;
            return;
        }
        throw new Error(`不支持${align}对齐方式`);
    }

    addComponent(cmp) {
        this.root.addChild(cmp);
    }

    draw(container, parentMatrix) {
        this.dom.style.position = "absolute";
        this.dom.style.left = "0";
        this.dom.style.top = "0";
        switch (this.mode) {
            case "svg": {
                container.appendChild(this.dom);
                this.dom.setAttribute("transform", this.matrix.toCSSString());
                let size = this.root.getSize();
                this.dom.setAttribute("width", size.width);
                this.dom.setAttribute("height", size.height);
                this.dom.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
                this.dom.style.transformOrigin = "left top";
                this.dom.innerHTML = this.root.innerSVGString();
                break;
            }
            case "canvas": {
                let pixRatio = window.devicePixelRatio;
                let size = this.containerSize;
                let context = this.dom.getContext("2d");
                if (!container.contains(this.dom)) {
                    container.appendChild(this.dom);
                }
                let aspectRatio = size.width / size.height;
                let canvasWidth = Math.min(4000,size.width * pixRatio);
                this.dom.setAttribute("width", canvasWidth);
                this.dom.setAttribute("height", canvasWidth / aspectRatio);
                this.dom.style.width = this.containerSize.width + "px";
                this.dom.style.height = this.containerSize.height + "px";
                let _ratio = canvasWidth / size.width;
                let pixRatioMatrix = Matrix.scale(_ratio, _ratio);
                this.root.toCanvas(context, pixRatioMatrix.multiply(this.matrix));
                break;
            }
        }
    }
}
export default Layer;
