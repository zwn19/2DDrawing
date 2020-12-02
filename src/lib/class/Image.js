/* eslint-disable */
import Rectangle from "./Rectangle";
import Matrix from "../math/Matrix";
import RectArea from "../math/geometry/base/RectArea";
const ALIGN_STRATEGY = function (type,imageSize,viewportSize){
    if (type === "none") {
        let scalex = viewportSize.width / imageSize.width;
        let scaley = viewportSize.height / imageSize.height;
        return Matrix.scale(scalex,scaley);
    }
    let reg = /^x(\w+)y(\w+)$/i;
    let m = type.match(reg);
    let xStrategy = m[1];
    let yStrategy = m[2];
    const FactorMap = {
        Max: 1,
        Mid: 0.5,
        Min: 0
    };
    let deltaWidth = (viewportSize.width - imageSize.width) * FactorMap[xStrategy];
    let deltaHeight = (viewportSize.height - imageSize.height) * FactorMap[yStrategy];
    return Matrix.translate(deltaWidth,deltaHeight);
};

const SCALE_BY_CONTAIN_STRATEGY = {
    meet(imgSize,viewportSize) {
        let aspect = imgSize.width / imgSize.height;
        let _aspect = viewportSize.width / viewportSize.height;
        let scale;
        if (aspect > _aspect) {
            // image宽度与viewport宽度对齐
            scale = viewportSize.width / imgSize.width;
        } else {
            // image高度与viewport高度对齐
            scale = viewportSize.height / imgSize.height;
        }
        return scale;
    },
    slice(imgSize,viewportSize) {
        let aspect = imgSize.width / imgSize.height;
        let _aspect = viewportSize.width / viewportSize.height;
        let scale;
        if (aspect < _aspect) {
            // image宽度与viewport宽度对齐
            scale = viewportSize.width / imgSize.width;
        } else {
            // image高度与viewport高度对齐
            scale = viewportSize.height / imgSize.height;
        }
        return scale;
    }
};

class Image extends Rectangle{
    constructor(attrs, style) {
        let defultProps = {
            preserveAspectRatio: "xMidYMid meet"
        };
        super(Object.assign(defultProps,attrs), style);
        this.tagName = "image";
        this.loadingPromise = new Promise((resolve) => {
            let img = new window.Image();
            img.src = this.getProps("xlink:href");
            img.onload =  () => {
                let { width, height } = this.props;
                let { width: imgWidth, height: imgHeight} = img;
                let imgAspect = imgWidth / imgHeight;
                if (!width && !height) {
                    this.setProps("width", width);
                    this.setProps("height", height);
                } else if (!height) {
                    this.setProps("height", width / imgAspect);
                } else if(!width) {
                    this.setProps("width", height * imgAspect);
                } else {
                    let imgSize = { width: imgWidth, height: imgHeight};
                    let containerSize = { width, height };
                    let preserveAspectRatio = this.getProps("preserveAspectRatio");
                    let [align,contain] = preserveAspectRatio.split(" ");
                    let imgArea = new RectArea({x:0,y:0}, { width: imgWidth, height: imgHeight});
                    let viewportArea = new RectArea({x:0,y:0}, { width, height });
                    let imgScale = SCALE_BY_CONTAIN_STRATEGY[contain](imgSize,containerSize);
                    let scaleMatrix = Matrix.scale(imgScale);
                    let _imgArea = imgArea.applyMatrix(scaleMatrix);
                    let alignMatrix = ALIGN_STRATEGY(align,_imgArea.getSize(), containerSize);
                    _imgArea = _imgArea.applyMatrix(alignMatrix);
                    if (contain === "meet") {
                        this.destArea = {
                            x: _imgArea.start.x,
                            y: _imgArea.start.y,
                            width: _imgArea.size.width,
                            height: _imgArea.size.height
                        };
                        this.imageSlice = {
                            x: 0,
                            y: 0,
                            width: img.width,
                            height: img.height
                        }
                    } else {
                        let destArea = viewportArea.getRectIntersection(_imgArea);
                        let area = destArea.applyMatrix(alignMatrix.getInverse()).applyMatrix(scaleMatrix.getInverse());
                        console.log(destArea,area);
                        this.imageSlice = {
                            x: area.start.x,
                            y: area.start.y,
                            width: area.size.width,
                            height: area.size.height
                        }
                        this.destArea = {
                            x: destArea.start.x,
                            y: destArea.start.y,
                            width: destArea.size.width,
                            height: destArea.size.height
                        };
                    }
                }
                resolve(img);
            }
        });
    }

    drawPath(context) {
        return new Promise(() => {
            this.loadingPromise.then((img) => {
                let imageSlice = this.imageSlice;
                let destArea = this.destArea;
                context.drawImage(img,imageSlice.x,imageSlice.y,imageSlice.width,imageSlice.height,destArea.x,destArea.y,destArea.width,destArea.height);
            });
        });
    }
}
export default Image;
