/* eslint-disable */
import Entity from "./Entity";
import Rectangle2d from "../math/2d/Rectangle";
import Polygon from "./Polygon";

class Rectangle extends Entity{
    constructor(attrs, style) {
        let defaultProps = {
            x: 0,
            y: 0
        };
        super(Object.assign(defaultProps, attrs), style);
        this.tagName = "rect";
        let {
            x,y,width,height
        } = this.props;
        this.geometry = new Rectangle2d({x,y},{width,height});
    }
    drawPath(context) {
        context.beginPath();
        let start = this.geometry.getStart();
        let size = this.geometry.getSize();
        context.rect(start.x,start.y,size.width,size.height);
        context.closePath();
    }
    toPolygon() {
        let points = this.geometry.getPoints();
        let str = points.map(p => `${p.x},${p.y}`).join(" ")
        let props = { ...this.props };
        props.points = str;
        ["x","y","width","height"].forEach(p => {
            delete props[p];
        });
        return new Polygon(props,this.style);
    }
}
export default Rectangle;
