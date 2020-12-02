/* eslint-disable */
import { arrayIntersection } from "../../../utils"
import Vector from "../base/Vector";
import LineSegment from "../curve/LineSegment";
import { range } from "../../../utils"
import { calculateCrossPoints } from "../curve"
import Circle from "../curve/Circle";
class Angle {
    constructor(point,vector1,vector2) {
        this.vertex = point;
        this.vector1 = vector1;
        this.vector2 = vector2;
        this.value = vector1.getCrossAngle(vector2);
    }
    getVertex() {
        return this.vertex;
    }
    getValue() {
        return this.value;
    }
    getAbsValue() {
        return Math.abs(this.getValue());
    }
    getSplitVectors(count) {
        let unitAngle = this.getValue() / count;
        let ret = [];
        for(let i of range(1,count)) {
            let vec = this.vector1.rotate(unitAngle * i);
            ret.push(vec);
        }
        return ret;
    }
    getSplitLineSegs(count) {
        let vecs = this.getSplitVectors(count);
        vecs.map(v => {
            return v.getLineSeg(this.vertex)
        });
    }
    split(count) {
        if(count === 1) {
            return [this]
        }
        let unitAngle = this.getValue() / count;
        let current = this.vector1;
        let ret = [];
        for(let i in range(1,count)) {
            let vec = this.vector1.rotate(unitAngle * i);
            let ang = new Angle(this.vertex,current,vec);
            ret.push(ang);
            current = ang;
        }
        return ret;
    }
    chamfer(len1,len2) {
        let p1 = this.vector1.getPoint(this.vertex);
        let p2 = this.vector2.getPoint(this.vertex);
        let _p1 = this.vector1.getPoint(this.vertex,len1);
        let _p2 = this.vector1.getPoint(this.vertex,len2);
        return [new LineSegment(p1,_p1),new LineSegment(_p1,_p2),new LineSegment(_p2,p2)]
    }
    round(r1,r2) {
        if (this.getAbsValue() >= Math.PI) {
            throw new Error("角度大于180度");
        }
        let [middleVec] = this.getSplitVectors(2);
        let len = r1 / Math.sin(this.getAbsValue() / 2);
        let center = middleVec.getPoint(this.vertex,len);
        let len2 = r1 / Math.tan(this.getAbsValue() / 2);
        let p1 = this.vector1.getPoint(this.vertex,len2);
        let p2 = this.vector2.getPoint(this.vertex,len2);
        return {
            p1: p1,
            p2: p2,
            center: center
        };
    }
}
Angle.fromTwoLines = function (lineSeg1,lineSeg2) {
    let points1 = lineSeg1.getPoints();
    let points2 = lineSeg2.getPoints();
    let arr = arrayIntersection(points1,points2);
    if (arr.length === 0) {
        throw new Error("两个线段没有共同交点")
    }
    let point = arr[0];
    let p1 = points1.filter(p => !point.equals(p))[0];
    let p2 = points2.filter(p => !point.equals(p))[0];
    let vec1 = Vector.fromTwoPoints(point,p1);
    let vec2 = Vector.fromTwoPoints(point,p2);
    return new Angle(point, vec1,vec2)
}
export default Angle
