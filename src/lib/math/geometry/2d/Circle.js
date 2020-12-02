/* eslint-disable */
import CircleCurve from "../curve/Circle";
import {getPointsCenter} from "../../utils";

class Circle {
    constructor(center, radius) {
        this.formular = new CircleCurve(center,radius);
        this.points = this.formular.generatePoints();
        this.lines = this.formular.generateLineSegments();
    }
    length() {
        return this.formular.length();
    }
    getPoints() {
        return this.points;
    }
    getLines() {
        return this.lines;
    }
    getCenter() {
        return this.formular.center;
    }
    applyMatrix(matrix) {
        let p1 = this.formular.getPointByAngle(0);
        let _p1 = p1.applyMatrix(matrix);
        let _center = this.formular.center.applyMatrix(matrix);
        let radius = _p1.distanceTo(_center);
        return new Circle(_center,radius);
    }
}
export default Circle;
