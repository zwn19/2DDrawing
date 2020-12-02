/* eslint-disable */
import EllipseCurve from "../curve/Ellipse";
import Polygon from "./Polygon";
import {getPointsCenter} from "../../utils";

class Ellipse {
    constructor(center, radiusX, radiusY) {
        this.formular = new EllipseCurve(center,radiusX,radiusY);
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
    applyMatrix(matrix) {
        let points = this.points.map(p => p.applyMatrix(matrix));
        return new Polygon(points);
    }
    getCenter() {
        return getPointsCenter(this.getPoints());
    }
}
export default Ellipse;
