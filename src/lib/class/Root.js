/* eslint-disable */
import Group from "./Group";

class Root extends Group{
    constructor(attrs,style) {
        super(attrs,style);
        this.tagName = "svg";
    }
    setSize({width, height}) {
        this.props.width = parseFloat(width);
        this.props.height = parseFloat(height);
    }
    getSize() {
        return {
            width: this.props.width,
            height: this.props.height
        }
    }
    toCanvas(context) {
        context.save();
        let matrix = this.getCurrentMatrix();
        context.transform.apply(context, matrix.toCSSMatrixArray());
        this.children.forEach(ele => {
            ele.toCanvas(context);
        });
        context.restore();
    }
}
export default Root;
