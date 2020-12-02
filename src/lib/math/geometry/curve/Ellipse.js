/* eslint-disable */
import Point from "../base/Point";
import LineSegment from "./LineSegment";
import {roundRadian, toDegree} from "../../utils"
import Range from "../base/Range"
import PolarCoordinateSystem from "../base/PolarCoordinateSystem";
// x^2/a + y^2/b = 1;
let Tolerance = new Range(1 - 0.005,1 + 0.005);
class Ellipse {
    constructor(center,radius1, radius2,startAngle = 0,endAngle = Math.PI * 2) {
        this.center = new Point(center.x,center.y);
        this.angleRange = new Range(startAngle, endAngle);
        this.a = radius1;
        this.b = radius2;
        this.polarSystem = new PolarCoordinateSystem(this.center, this.a / this.b);
        this.start = startAngle;
        this.end = endAngle;
    }
    getAbsAngle() {
        let { min, max } = this.angleRange;
        return Math.abs(max - min);
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
    splitByPoints(points, isReverse) {
        if (points.length <= 1) {
            return new Ellipse(this.center,this.a,this.b);
        }
        let _points = points.filter(p => this.isInCurve(p));
        let polarSys = this.polarSystem;
        let angles = _points.map(p => {
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
                return new Ellipse(this.center,this.a,this.b,next,ang);
            }
            return new Ellipse(this.center,this.a,this.b,ang,next);
        }).filter(f => f);
        return curves;
    }
    isAngleInRange(angle) {
        angle = roundRadian(angle);
        return this.angleRange.isInRange(angle);
    }
    generatePoints(count) {
        count = count || (toDegree(this.getAbsAngle()) / 2);
        let { min: startAngle, max: endAngle } = this.angleRange;
        let unit = (endAngle - startAngle) / count;
        let cur = startAngle;
        let points = [];
        for(let i = 0;i <= count ;i++) {
            cur += unit;
            let x = this.a * Math.cos(cur) + this.center.x;
            let y = this.b * Math.sin(cur) + this.center.y;
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
    length() {
        let lines = this.generateLineSegments(100);
        let _sum = lines.reduce((sum, line) => {
            sum += line.length();
            return sum;
        },0);
        return _sum;
    }
    isInArea(point) {
        return point.x * point.x / this.a + point.y * point.y / this.b < 1;
    }
    getX(y) {
        let theta = Math.asin(y / this.b);
        let angles = [theta,Math.PI-theta].filter(p => this.isAngleInRange(p));
        let ret = Utils.uniqueArray(angles).map(ang => {
            return this.a * Math.cos(ang);
        });
        return ret;
    }
    getY(x) {
        let theta = Math.acos(x / this.radius);
        let angles = [theta,-theta];
        angles = angles.filter(p => this.isAngleInRange(p));
        let ret = Utils.uniqueArray(angles).map(ang => {
            return this.radius * Math.sin(ang);
        });
        return ret;
    }
    getPointAngle(p) {
        let polarSys = this.polarSystem;
        return polarSys.getPointFromOriginSystem(p).theta;
    }
    isInCurve(point) {
        let x = point.x - this.center.x;
        let y = point.y - this.center.y;
        let del = x * x / this.a / this.a + y * y / this.b / this.b;
        return Tolerance.isInRange(del);
    }
    applyMatrix(matrix) {

    }
}
export default Ellipse;
