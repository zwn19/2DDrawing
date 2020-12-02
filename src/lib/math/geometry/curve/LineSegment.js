/* eslint-disable */
import Line from "./Line";
import Range2D from "../base/Range2D";
import Point from "../base/Point";
import Ray from "./Ray";
import Matrix from "../../Matrix";

class LineSegment {
    constructor(start, end) {
        this.line = Line.getLineByTwoPoints(start,end);
        this.range = new Range2D(start,end);
        this.start = new Point(start.x,start.y);
        this.end = new Point(end.x,end.y);
    }
    getRandomPoint() {
        return this.line.getRandomPoint(this.range);
    }
    getPoints() {
        return [this.start.copy(),this.end.copy()];
    }

    getCenter() {
        return Point.center(this.start,this.end);
    }
    getPointByRatio(ratio) {
        let matrix = Matrix.scale(ratio,ratio,this.start);
        return this.end.applyMatrix(matrix);
    }
    length() {
       return this.start.distanceTo(this.end);
    }
    getX(y) {
        let x = this.line.getX(y);
        if (this.isInRange({x,y})) {
            return x;
        }
    }
    getY(x) {
        let y = this.line.getY(x);
        if (this.isInRange({x,y})) {
            return y;
        }
    }
    getK() {
        return this.line.getK();
    }
    equals(lineSegment) {
        if (lineSegment instanceof LineSegment) {
            if (this.start.equals(lineSegment.start) && this.end.equals(lineSegment.end)) {
                return true;
            } else if(this.start.equals(lineSegment.end) && this.end.equals(lineSegment.start)) {
                return true;
            }
            return false;
        }
        return false;
    }
    isInCurve(point) {
        if(this.line.isInLine(point)) {
            return this.isInRange(point);
        }
        return false;
    }
    isInRange({x,y}) {
        return this.range.isInRange({x,y});
    }
    getCrossPoint(comp) {
        if (comp instanceof Line) {
            let p = this.line.getLineCrossPoint(comp);
            if (this.isInRange(p)) {
                return p;
            }
        }
        if (comp instanceof LineSegment) {
            let p = this.line.getLineCrossPoint(comp.line);
            if (this.isInRange(p) && comp.isInRange(p) ) {
                return p;
            }
        }
        if (comp instanceof Ray) {
            let p = this.line.getLineCrossPoint(comp.line);
            if(this.isInRange(p) && comp.isInRange(p)) {
                return p;
            }
        }
    }
    reverse() {
        let end = this.end;
        this.end = this.start;
        this.start = end;
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
    getNormalPoint(point) {
        let l = this.getNormalLine(point);
        return l.getCrossPoint(this.line);
    }
    getNormalLine(point) {
        return this.line.getNormalLine(point);
    }
    applyMatrix(matrix) {

    }
}
export default LineSegment;
