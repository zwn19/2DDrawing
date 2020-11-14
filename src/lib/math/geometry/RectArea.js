/* eslint-disable */
import Point from "./Point";
import LineSegment from "./curve/LineSegment";

class RectArea {
    constructor(start,{ width, height }) {
        this.start = start;
        this.size = { width, height };
    }
    getStart() {
        return new Point(this.start.x, this.start.y)
    }
    getSize() {
        return { ...this.size };
    }
    applyMatrix(matrix) {
        let points = this.getPoints();
        let _points = points.map(p => p.applyMatrix(matrix));
        return RectArea.fromPoints(_points);
    }
    getRectIntersection(rectArea) {
        let points = this.getPoints();
        let points1 = points.filter(p => rectArea.containsPoint(p));
        points = rectArea.getPoints();
        let points2 = points.filter(p => this.containsPoint(p));
        let crossPoints = [];
        let line1s = this.getBoundaries();
        let line2s = rectArea.getBoundaries();
        line1s.forEach(l => {
            line2s.forEach(_l => {
                let p = l.getCrossPoints(_l);
                if(p && p[0]) {
                    crossPoints.push(p[0]);
                }
            });
        });
        return RectArea.fromPoints([...points1,...points2,...crossPoints]);
    }
    getBoundaries() {
        let [p1,p2,p3,p4] = this.getPoints();
        let line1 = new LineSegment(p1,p2);
        let line2 = new LineSegment(p2,p3);
        let line3 = new LineSegment(p3,p4);
        let line4 = new LineSegment(p4,p1);
        return [line1,line2,line3,line4,];
    }
    getPoints() {
        let {
            start,
            size,
        } = this;
        let p1 = new Point(start.x,start.y);
        let p2 = new Point(start.x + size.width,start.y);
        let p3 = new Point(start.x + size.width,start.y + size.height);
        let p4 = new Point(start.x,start.y+ size.height);
        return [p1,p2,p3,p4];
    }
    checkImpactCircle(center,radius) {
        if (this.containsPoint(center)) {
            return true;
        }
        return false;
    }
    checkImpact(rectArea) {
        let points = rectArea.getPoints();
        for(let i=0;i<points.length;i++) {
            if(this.containsPoint(points[i])) {
                return true;
            }
        }
        points = this.getPoints();
        for(let i=0;i<points.length;i++) {
            if(rectArea.containsPoint(points[i])) {
                return true;
            }
        }
        let lines1 = this.getBoundaries();
        let lines2 = rectArea.getBoundaries();
        for(let i=0;i<lines1.length;i++) {
            for(let j=0;j<lines2.length;j++) {
                if(lines1[i].getCrossPoint(lines2[j])) {
                    return true;
                }
            }
        }
        return false;
    }
    containsRectArea(rectArea) {
        let points = rectArea.getPoints();
        for(let i=0;i<points.length;i++) {
            if(!this.containsPoint(points[i])) {
                return false;
            }
        }
        return true;
    }
    containsPoint({x,y},inBoundary = true) {
        let {
            start,
            size,
        } = this;
        let deltaX = x - start.x;
        let deltaY = y - start.y;
        if(inBoundary) {
            return deltaX >= 0 && deltaY >= 0 && deltaX <= size.width && deltaY <= size.height;
        }else {
            return deltaX > 0 && deltaY > 0 && deltaX < size.width && deltaY < size.height;
        }
    }
}
RectArea.fromPoints = function(points) {
    if (points && points.length) {
        const _point = {
            minx: Number.MAX_SAFE_INTEGER,
            miny: Number.MAX_SAFE_INTEGER,
            maxx: Number.MIN_SAFE_INTEGER,
            maxy: Number.MIN_SAFE_INTEGER,
        };
        points.forEach((p) => {
            _point.maxx = Math.max(_point.maxx, p.x);
            _point.maxy = Math.max(_point.maxy, p.y);
            _point.minx = Math.min(_point.minx, p.x);
            _point.miny = Math.min(_point.miny, p.y);
        });
        const {
            minx, miny, maxx, maxy,
        } = _point;
        const width = maxx - minx;
        const height = maxy - miny;
        let start = new Point(minx,miny);
        let size = {width,height};
        return new RectArea(start,size);
    }
}
export default RectArea;
