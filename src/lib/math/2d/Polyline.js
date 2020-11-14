/* eslint-disable */

import LineSegment from "../geometry/curve/LineSegment";
import Point from "../geometry/Point";
import {getPointsCenter} from "../utils";

class Polyline {
    constructor(points) {
        this.points = points.map(p => {
            return new Point(p.x,p.y);
        });
        this.lines = [];
        this.points.forEach((p,i) => {
            if (this.points[i-1]) {
                this.lines.push(new LineSegment(this.points[i-1],p))
            }
        });
    }
    length() {
        return this.lines.reduce((sum,l) => {
                return sum + l.length();
        },0);
    }
    getPoints() {
        return this.points;
    }
    getLines() {
        return this.lines;
    }
    applyMatrix(matrix) {
        let points = this.points;
        let _points = points.map(p => p.applyMatrix(matrix));
        return new Polyline(_points);
    }
    getCenter() {
        return getPointsCenter(this.getPoints());
    }
}
export default Polyline;
