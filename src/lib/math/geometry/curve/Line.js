/* eslint-disable */
import Matrix from "../../Matrix"
import Point from "../Point";
import Range from "../Range";
import Ray from "./Ray";
import LineSegment from "./LineSegment";
// ax+by=c;

function factorEquals(k1,k2) {
    if(k1 === k2) {
        return true;
    }
    return Math.abs((k1 - k2) / (k1 + k2)) < 0.005;
}
class Line{
    constructor(a,b,c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.tolerance = new Range(c - 0.001,c + 0.001);
    }
    getPointsByPointLength(point,length) {
        if (this.isInCurve(point)) {
            if (this.b === 0) {
                return [new Point(point.x,point.y + length),new Point(point.x,point.y - length)];
            } else {
                let k = this.getK();
                let deltaX = Math.sqrt(length * length / (1 + k * k));
                return [new Point(point.x + deltaX, this.getY(point.x + deltaX)),new Point(point.x - deltaX, this.getY(point.x - deltaX))]
            }
        }
    }
    getNormalLine(point) {
        let k = this.getK();
        if (k === 0) {
            return new Line(1,0,point.x);
        } else {
            return Line.getLineByKAndPoint(-1/ k,point);
        }
    }
    getNormalPoint(point) {
        let l = this.getNormalLine(point);
        return l.getCrossPoint(this);
    }
    getRandomPoint(range2D) {
        let x = ~~(1000 * Math.random());
        let y = this.getY(x);
        let p = new Point(x,y);
        if (range2D) {
            if (range2D.isInRange(p)) {
                return p;
            }
            return this.getRandomPoint(range2D);
        }
        return p;
    }
    getX(y) {
        if(this.a) {
            return (this.c - this.b * y) / this.a;
        }
        let x = ~~(1000 * Math.random());
        return {x,y};
    }
    getY(x) {
        if(this.b) {
            return (this.c - this.a * x) / this.b;
        }
        let y = ~~(100 * Math.random());
        return {x,y};
    }
    getK() {
        if(this.b) {
            return -this.a/this.b;
        }
        return Math.tan(Math.PI / 2);
    }
    equals(line) {
        return this.a === line.a && this.b === line.b;
    }
    isInCurve(point) {
        let ret = this.a * point.x + this.b * point.y;
        if (this.tolerance.isInRange(ret)) {
            return true;
        }
        return false;
    }
    isInRange() {
        return true;
    }
    getLineCrossPoint(line) {
        let [x,y] = Matrix.resolveFormulaGroup([[this.a,this.b,this.c],[line.a,line.b,line.c]]);
        return new Point(x,y);
    }
    getCrossPoint(comp) {
        if (comp instanceof Line) {
            let p = this.getLineCrossPoint(comp);
            return p;
        }
        if (comp instanceof LineSegment) {
            let p = this.getLineCrossPoint(comp.line);
            if (comp.isInRange(p) ) {
                return p;
            }
        }
        if (comp instanceof Ray) {
            let p = this.getLineCrossPoint(comp.line);
            if(comp.isInRange(p)) {
                return p;
            }
        }
    }
    isParallel(line) {
        return !this.equals(line) && factorEquals(line.getK(), this.getK());
    }
    isPerpendicular(line) {
        return factorEquals(line.getK() * this.getK(), -1);
    }
    distanceToPoint(point) {
        let p = this.getNormalPoint(point);
        return p.distanceTo(point);
    }
}
Line.getLineByTwoPoints = function(p1,p2) {
    if (p2.x !== p1.x) {
        let k = (p2.y - p1.y) / (p2.x - p1.x);
        return Line.getLineByKAndPoint(k, p1);
    }
    return new Line(0,1,p1.y);
};
Line.getLineByKAndPoint = function(k,point) {
    let c = point.y - k * point.x;
    let a = -k;
    let b = 1;
    return new Line(a,b,c);
};
export default Line;
