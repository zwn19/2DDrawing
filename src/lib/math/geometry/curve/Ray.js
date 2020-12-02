/* eslint-disable */
import Vector from "../base/Vector";
import Point from "../base/Point";
import Line from "./Line";
import LineSegment from "./LineSegment";

class Ray {
    constructor(start,end) {
        let vec = new Vector(end.x - start.x,end.y - start.y);
        this.start = new Point(start.x,start.y);
        this.vector = vec;
        this.line = Line.getLineByTwoPoints(start,end);
    }
    getX(y) {
        let x = this.line.getX(y);
        let vec = new Vector(x - this.start.x, y - this.start.y);
        return Math.abs(this.vector.getCrossAngle(vec)) < 0.1 / 180 * Math.PI;
    }
    getY(x) {
        let y = this.line.getY(x);
        let vec = new Vector(x - this.start.x, y - this.start.y);
        return Math.abs(this.vector.getCrossAngle(vec)) < 0.1 / 180 * Math.PI;
    }
    getK() {
        return this.line.getK();
    }
    equals(ray) {
        if (ray instanceof Ray) {
            return this.start.equals(ray.start) && this.vector.unitVector().equals(ray.vector.unitVector()) && this.line.equals(ray.line);
        }
        return false;
    }
    isInRange(point) {
        let vec = Vector.fromTwoPoints(this.start,point);
        return this.vector.innerProduct(vec) > 0;
    }
    isInCurve(point) {
        let vec = new Vector(point.x - this.start.x, point.y - this.start.y);
        return Math.abs(this.vector.getCrossAngle(vec)) < 0.01 / 180 * Math.PI;
    }
    getCrossPoint(comp) {
        if (comp instanceof Line) {
            let p = this.line.getLineCrossPoint(comp);
            return this.isInRange(p) ? p : null;
        }
        if (comp instanceof LineSegment) {
            let p = this.line.getLineCrossPoint(comp.line);
            if (this.isInRange(p) && comp.isInRange(p)) {
                return p;
            }
        }
        if (comp instanceof Ray) {
            let p = this.line.getLineCrossPoint(comp.line);
            if (this.isInRange(p) && comp.isInRange(p)) {
                return p;
            }
        }
    }
    isParallel(line) {
        if (line.line) {
            return this.isParallel(line.line);
        } else {
            this.line.isParallel(line);
        }
    }
    isPerpendicular(line) {
        if (line.line) {
            return this.isPerpendicular(line.line);
        } else {
            this.line.isPerpendicular(line);
        }
    }
    applyMatrix(matrix) {

    }
}
export default Ray;
