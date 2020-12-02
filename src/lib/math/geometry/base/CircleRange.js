/* eslint-disable */
import { distance } from "../../utils";

class CircleRange {
    constructor(point,radius) {
        this.center = {
            x: point.x,
            y: point.y
        };
        this.radius = radius;
    }
    isInRange(point, contains = true) {
        if (contains) {
            return distance(point,this.center) <= this.radius;
        }
        return distance(point,this.center) < this.radius;
    }
}
export default CircleRange;
