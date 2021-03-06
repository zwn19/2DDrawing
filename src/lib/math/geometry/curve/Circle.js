/* eslint-disable */
import Point from "../base/Point";
import LineSegment from "./LineSegment";
import {roundRadian, toDegree, uniqueArray} from "../../utils"
import Range from "../base/Range"
import PolarCoordinateSystem from "../base/PolarCoordinateSystem";
import Vector from "../base/Vector";
import {transToProperRadian} from "../../../utils";
import AngleRange from "../base/AngleRange";
let Tolerance = new Range(1 - 0.001,1 + 0.001);
class Circle {
    constructor(center,radius,startAngle = 0,deltaAngle = Math.PI * 2) {
        this.deltaAngle = deltaAngle;
        this.center = new Point(center.x,center.y);
        this.radius = parseFloat(radius);
        startAngle = transToProperRadian(startAngle);
        let endAngle = transToProperRadian(startAngle + deltaAngle);
        this.angleRange = new AngleRange(startAngle, deltaAngle);
        this.polarSystem = new PolarCoordinateSystem(this.center);
        this.start = startAngle;
        this.end = endAngle;
    }
    getStartPoint() {
        return this.getPointByAngle(this.start);
    }
    getEndPoint() {
        return this.getPointByAngle(this.end);
    }
    getAbsAngle() {
        return Math.abs(this.deltaAngle);
    }
    getStartAngle() {
        return this.start;
    }
    getEndAngle() {
        return this.end;
    }
    getCenter() {
        return this.center;
    }
    getRadius() {
        return this.radius;
    }
    isAngleInRange(angle) {
        return this.angleRange.isInRange(angle);
    }
    generatePoints(count) {
        count = count || (toDegree(this.getAbsAngle()) / 2);
        let unit = this.deltaAngle / count;
        let cur = this.getStartAngle();
        let points = [];
        for(let i = 0;i <= count ;i++) {
            cur += unit;
            let x = this.radius * Math.cos(cur) + this.center.x;
            let y = this.radius * Math.sin(cur) + this.center.y;
            let p = new Point(x,y);
            points.push(p);
        }
        return points;
    }
    generateLineSegments(count) {
        let points = this.generatePoints(count);
        let lines = [];
        points.forEach((p,i) => {
            let pre = points[i-1];
            if (pre) {
                let l = new LineSegment(pre, p);
                lines.push(l);
            }
        });
        return lines;
    }
    isInArea(point) {
        return Point.distance(point,this.center) <= this.radius;
    }
    isInCurve(point) {
        let x = point.x - this.center.x;
        let y = point.y - this.center.y;
        let del = x * x / this.radius / this.radius + y * y / this.radius / this.radius;
        return Tolerance.isInRange(del);
    }
    getX(y) {
        let theta = Math.asin(y / this.radius);
        let angles = [theta,Math.PI-theta].filter(p => this.isAngleInRange(p));
        let ret = uniqueArray(angles).map(ang => {
            return this.radius * Math.cos(ang);
        });
        return ret;
    }
    getY(x) {
        let theta = Math.acos(x / this.radius);
        let angles = [theta,-theta];
        angles = angles.filter(p => this.isAngleInRange(p));
        let ret = uniqueArray(angles).map(ang => {
            return this.radius * Math.sin(ang);
        });
        return ret;
    }
    getPointByAngle(angle) {
        if (this.isAngleInRange(angle)) {
            let radius = this.radius;
            let {x,y} = this.center;
            return new Point(radius * Math.cos(angle) + x,radius * Math.sin(angle) + y);
        }
    }
    length() {
        let { min: startAngle, max: endAngle } = this.angleRange;
        let delta = endAngle - startAngle;
        return this.radius * delta;
    }
    splitByPoints(points, isReverse) {
        if (points.length <= 1) {
            return new Circle(this.center,this.radius);
        }
        points = points.filter(p => this.isInCurve(p));
        let polarSys = this.polarSystem;
        let angles = points.map(p => {
           return polarSys.getPointFromOriginSystem(p).theta;
        });
        angles.sort();
        angles.push(angles[0] + Math.PI * 2);
        let curves = angles.map((ang,index) => {
            let next = angles[index + 1];
            if (!next) {
                return;
            }
            if (isReverse) {
                return new Circle(this.center,this.radius,next,ang - next);
            }
            return new Circle(this.center,this.radius,ang,next - ang);
        }).filter(f => f);
        return curves;
    }
    getPointAngle(p) {
        let polarSys = this.polarSystem;
        return polarSys.getPointFromOriginSystem(p).theta;
    }
    isReverse(p1,p2,isLargeArc) {
        let ang1 = this.getPointAngle(p1);
        let ang2 = this.getPointAngle(p2);

        if (ang2 < ang1) {
            ang2 = ang2 + Math.PI * 2;
        }
        let delta = ang2 - ang1;
        if (isLargeArc) {
            return delta <= Math.PI;
        }
        return delta > Math.PI;
    }
    applyMatrix(matrix) {
        let center = this.getCenter();
        let _center = center.applyMatrix(matrix);
        let start = this.getStartPoint();
        let _start = start.applyMatrix(matrix);
        let line = Vector.fromTwoPoints(center,start);
        let _line = Vector.fromTwoPoints(_center,_start);
        let deltaAngle = _line.getCrossAngle(line)
        let _startAngle = this.start + deltaAngle;
        let radius = start.distanceTo(center);
        return new Circle(center,radius, _startAngle , this.deltaAngle)
    }
}
export default Circle;
