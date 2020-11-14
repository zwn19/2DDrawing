/* eslint-disable */
import Point from "./Point";
import Matrix from "../Matrix";
import LineSegment from "./curve/LineSegment";

class Vector{
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    getLineSeg(origin, len) {
        let p = this.getPoint(origin,len);
        return new LineSegment(origin,p);
    }
    getPoint(origin,len) {
        if (len === undefined) {
            return new Point(origin.x + this.x, origin.y + this.y);
        }
        let scale = len / this.length()
        let m = Matrix.scale(scale);
        let point = new Point(this.x,this.y);
        point = point.applyMatrix(m);
        let v = new Vector(point.x,point.y);
        return v.getPoint(origin);
    }
    length() {
        let {x,y} = this;
        return Math.sqrt(x * x + y * y);
    }
    plus(vec) {
        let { x, y } = vec;
        this.x = this.x + x;
        this.y = this.y + y;
    }
    equals(vec) {
        if (vec instanceof Vector) {
            return this.x === vec.x && this.y === vec.y;
        }
        return false;
    }
    multiply(number) {
        this.x = this.x * number;
        this.y = this.y * number;
    }
    // 內积
    innerProduct(vec) {
        let { x, y } = this;
        let { x: _x, y: _y } = vec;
        return x * _x + _y * y;
    }
    unitVector() {
        let len = this.length();
        let { x,y } = this;
        return new Vector(x / len, y / len);
    }
    getCrossAngle(vec) {
        let acos = this.innerProduct(vec) / (vec.length() * this.length());
        let sign = this.crossMultiply(vec) > 0 ? 1 : -1;
        return sign * Math.acos(acos);
    }
    getPolarAngle() {
        let vec = new Vector(1,0);
        return this.getCrossAngle(vec);
    }
    /* a = (x1,y1) b = (x2,y2)
      a×b = x1y2 - x2y1
      正方向为X正向到Y正向，
      >0为正向
      <0为反向
   */
    crossMultiply(vec) {
        let { x, y } = this;
        let { x: _x, y: _y } = vec;
        return x * _y - _x * y;
    }
    reverse() {
        let { x, y } = this;
        this.x = -x;
        this.y = -y;
    }
    copy() {
        let { x, y } = this;
        return new Vector(x,y);
    }
    // 垂直
    isPerpendicular(vector) {
        let { x, y } = this;
        let { x: _x, y: _y } = vector;
        return x *  _x + y * _y === 0;
    }
    // 平行
    isParallel(vector) {
        let { x, y } = this;
        let { x: _x, y: _y } = vector;
        return x * _y === _x * y;
    }
    setLength(len) {
        let _len = this.length();
        let times = len / _len
        let m = Matrix.scale(times)
        let point = new Point(this.x,this.y)
        point = point.applyMatrix(m);
        this.x = point.x;
        this.y = point.y;
    }
    rotate(angle) {
        let m = Matrix.rotate(angle)
        let vertex = new Point(this.x,this.y);
        vertex = vertex.applyMatrix(m);
        return new Vector(vertex.x,vertex.y);
    }
}
Vector.fromTwoPoints = function (start,end) {
    let vec = new Vector(end.x - start.x, end.y - start.y);
    return vec;
};
export default Vector;
