/* eslint-disable */
import Entity from "./Entity";
import Polyline2d from "../math/2d/Polyline";

class Polyline extends Entity{
    constructor(attrs, style) {
        super(attrs, style);
        this.tagName = "polyline";
        let points = [];
        this.props.points.split(" ").forEach(pair => {
            let [x,y] = pair.split(",");
            points.push({x,y});
        });
        this.geometry = new Polyline2d(points);
    }
}
export default Polyline;
