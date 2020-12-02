/* eslint-disable */

import LineSegment from "../curve/LineSegment";
import {getPointsCenter} from "../../utils";

class Line {
    constructor(start,end) {
        this.formular = new LineSegment(start,end);
    }
    length() {
        return this.formular.length();
    }
    getPoints() {
        return [this.formular.start,this.formular.end];
    }
    getLines() {
        return [this.formular];
    }
    applyMatrix(matrix) {
        let { start, end } = this.formular;
        let _start = start.applyMatrix(matrix);
        let _end = end.applyMatrix(matrix);
        return new Line(_start,_end);
    }
    extendTo(boundaries) {

    }
    extendToLength(origin,len) {

    }
    getCenter() {
        return getPointsCenter(this.getPoints());
    }
}
export default Line;
