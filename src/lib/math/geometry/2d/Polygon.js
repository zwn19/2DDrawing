/* eslint-disable */

import LineSegment from "../curve/LineSegment";
import Point from "../base/Point";
import { getPointsCenter } from "../../utils";

class Polygon {
    constructor(points) {
        this.points = [...points].map(p => {
            return new Point(p.x,p.y);
        });
        this.lines = [];
        this.points.forEach((p,i) => {
            let pre = this.points[i-1] || this.points[this.points.length-1];
            this.lines.push(new LineSegment(pre,p));
        });
    }
    getCenter() {
        return getPointsCenter(this.getPoints());
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
        return new Polygon(_points);
    }
}
export default Polygon;
