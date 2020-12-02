/* eslint-disable */
import Point from "../base/Point";
import LineSegment from "./LineSegment";

class BezierCurve {
    // 本算法用折线代替贝塞尔曲线,只处理二阶和三阶
    constructor(controls) {
        if (controls) {
            this.init(controls);
        }
    }
    length() {
        this.lines.reduce((sum,line) => {
            sum = sum + line.length();
            return sum;
        },0);
    }
    sharpen(count = 30){
        this.init(this.controls,count);
    }
    init(controls,count) {
        this.lines = [];
        let points = BezierCurve.generatePoints(controls, count);
        points.unshift(new Point(controls[0].x,controls[0].y));
        for (let i = 1; i < points.length; i++) {
            const pre = points[i - 1];
            const cur = points[i];
            this.lines.push(new LineSegment(pre, cur));
        }
        this.points = points;
        this.controls = controls.map(c => new Point(c.x,c.y));
        this.start = points[0];
        this.end = points[points.length-1];
    }
    generatePoints(count) {
        let controls = this.controls;
        let points = BezierCurve.generatePoints(controls, count);
        points.unshift(new Point(controls[0].x,controls[0].y));
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
    getX(y) {
        let ret;
        this.lines.find(l => {
            let x = l.getX(y);
            if(x !== undefined) {
                ret = x;
                return true;
            }
        });
        return ret;
    }
    getY(x) {
        let ret;
        this.lines.find(l => {
            let y = l.getY(x);
            if(y !== undefined) {
                ret = y;
                return true;
            }
        });
        return ret;
    }
    isInCurve(p) {
        return !!this.lines.find(line => line.isInCurve(p));
    }
    applyMatrix(matrix) {

    }
}

BezierCurve.generatePoints = (controls, count = 15) => {
    let getPoint;
    if (controls.length === 3) {
        getPoint = (t) => {
            const p = {};
            const factor0 = (1 - t) * (1 - t);
            const factor1 = 2 * (1 - t) * t;
            const factor2 = t * t;
            p.x = factor0 * controls[0].x + factor1 * controls[1].x + factor2 * controls[2].x;
            p.y = factor0 * controls[0].y + factor1 * controls[1].y + factor2 * controls[2].y;
            return new Point(p.x,p.y);
        };
    } else if (controls.length === 4) {
        getPoint = (t) => {
            const p = {};
            const factor0 = (1 - t) * (1 - t) * (1 - t);
            const factor1 = 3 * (1 - t) * (1 - t) * t;
            const factor2 = 3 * (1 - t) * t * t;
            const factor3 = t * t * t;
            p.x = factor0 * controls[0].x + factor1 * controls[1].x + factor2 * controls[2].x + factor3 * controls[3].x;
            p.y = factor0 * controls[0].y + factor1 * controls[1].y + factor2 * controls[2].y + factor3 * controls[3].y;
            return new Point(p.x,p.y);
        };
    } else {
        throw new Error(`控制点数量为${controls.length}`);
    }
    const points = [];
    for (let i = 1; i <= count; i++) {
        const cur = getPoint(i / count);
        points.push(cur);
    }
    return points;
};
export default BezierCurve;
