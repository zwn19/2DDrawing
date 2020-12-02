/* eslint-disable */
import Matrix from "../../Matrix";
import CircleRange from "./CircleRange";
import Vector from "./Vector";
import LineSegment from "../curve/LineSegment";
class Point {
    constructor(x = 0, y = 0) {
        this.x = Math.round(x * 1000000000) / 1000000000;
        this.y = Math.round(y * 1000000000) / 1000000000;
        this.tolerance = new CircleRange(this, 0.001);
    }
    equals(p) {
        if(!p) {
            return false;
        }
        if (p === this) {
            return true;
        }
        return this.tolerance.isInRange(p);
    }
    set(x, y) {
        this.x = Math.round(x * 1000000000) / 1000000000;
        this.y = Math.round(y * 1000000000) / 1000000000;
    }
    move(x, y) {
        const _x = this.x + (x || 0) * 1;
        const _y = this.y + (y || 0) * 1;
        this.set(_x, _y);
    }
    copy() {
        return new Point(this.x, this.y);
    }
    distanceTo({x, y}) {
        let deltaX = this.x - x;
        let deltaY = this.y - y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    applyMatrix(matrix) {
        const { x, y } = this;
        const m = new Matrix([[x,y,1]]);
        const _m = m.multiply(matrix);
        const [_x,_y] = _m.getRow(0);
        return new Point(_x,_y);
    }
    toString() {
        return `${this.x},${this.y}`
    }
    polarSymmetry(point) {
        let vec = Vector.fromTwoPoints(this,point);
        return vec.getPoint(point);
    }
    mirror(p1,p2) {
        let l = new LineSegment(p1,p2);
        let l2 = l.line.getNormalLine(this);
        let cross = l.line.getCrossPoint(l2);
        return this.polarSymmetry(cross);
    }
}
Point.applyMatrixToPoint = ({x,y},matrix) => {
    const m = new Matrix([[x,y,1]]);
    const _m = m.multiply(matrix);
    const [_x,_y] = _m.getRow(0);
    return new Point(_x,_y);
}
Point.distance = (p1, p2) => {
    const deltaX = p1.x - p2.x;
    const deltaY = p1.y - p2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
Point.center = (p1, p2) => {
    const X = p1.x + p2.x;
    const Y = p1.y + p2.y;
    return new Point(X/2,Y/2);
};
Point.zeroPoint = () => {
    return new Point(0,0);
};
export default Point;
