/* eslint-disable */
import Entity from "./Entity";
import Circle2d from "../math/geometry/2d/Circle";
class Circle extends Entity{
    constructor(attrs, style) {
        let defaultProps = {
            cx: 0,
            cy: 0
        };
        super(Object.assign(defaultProps, attrs), style);
        this.tagName = "circle";
        let {
            cx,cy,r
        } = this.props;
        this.geometry = new Circle2d({x: cx,y: cy}, r);
    }
    drawPath(context) {
        context.beginPath();
        let { x, y } = this.geometry.formular.getCenter();
        let radius = this.geometry.formular.getRadius();
        context.arc(x,y,radius,0, Math.PI * 2);
        context.closePath();
    }
}
export default Circle;
