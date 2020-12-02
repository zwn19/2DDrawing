/* eslint-disable */
import LineSegment from "../curve/LineSegment";
import Polygon from "./Polygon";
import {getPointsCenter} from "../../utils";
import Point from "../base/Point";

class Rectangle {
    constructor(start,{ width , height }) {
        width = width * 1;
        height = height * 1;
        let p1 = start;
        start.x = start.x * 1;
        start.y = start.y * 1;
        let p2 = { x: start.x + width, y: start.y};
        let p3 = { x: start.x + width, y: start.y + height};
        let p4 = { x: start.x, y: start.y + height};
        this.lines = [
            new LineSegment(p1,p2),
            new LineSegment(p2,p3),
            new LineSegment(p3,p4),
            new LineSegment(p4,p1),
        ];
        this.points = [p1,p2,p3,p4].map(({x,y}) => new Point(x,y));
        this._area = width * height;
    }
    getStart() {
        return this.points[0];
    }
    getSize() {
        let p1 = this.points[0];
        let p3 = this.points[2];
        return {
            width: p3.x - p1.x,
            height: p3.y - p1.y
        }
    }
    length() {
        return this.lines.reduce((sum,l) => {
            return sum + l.length();
        },0);
    }
    getArea() {
        return this._area;
    }
    getPoints() {
        return this.points;
    }
    getLines() {
        return this.lines;
    }
    applyMatrix(matrix) {
        let points = this.getPoints().map(p => p.applyMatrix(matrix));
        return new Polygon(points);
    }
    getCenter() {
        return getPointsCenter(this.getPoints());
    }
}
export default Rectangle;
