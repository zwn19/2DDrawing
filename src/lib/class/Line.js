/* eslint-disable */
import Entity from "./Entity";
import Line2d from "../math/geometry/2d/Line";

class Line extends Entity{
    constructor(attrs, style) {
        super(attrs, style);
        this.tagName = "line";
        let { x1,y1,x2,y2 } = this.props;
        this.geometry = new Line2d({x:x1,y:y1},{x:x2,y:y2});
    }
}

export default Line;
