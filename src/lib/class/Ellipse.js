/* eslint-disable */
import Entity from "./Entity";
import Ellipse2d from "../math/2d/Ellipse";

class Ellipse extends Entity{
    constructor(attrs, style) {
        let defaultProps = {
            cx: 0,
            cy: 0
        };
        super(Object.assign(defaultProps,attrs), style);
        this.tagName = "ellipse";
        let {
            cx,cy,rx,ry
        } = this.props;
        this.geometry = new Ellipse2d({x: cx, y: cy},rx,ry);
    }
}
export default Ellipse;
