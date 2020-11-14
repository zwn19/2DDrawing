/* eslint-disable */
class Range2D {
    constructor(start,end) {
        this.minx = Math.min(start.x,end.x);
        this.miny = Math.min(start.y,end.y);
        this.maxx = Math.max(start.x,end.x);
        this.maxy = Math.max(start.y,end.y);
    }
    isInRange(point, contains = true) {
        let {x,y} = point;
        if (contains) {
            return x >= this.minx && x <= this.maxx && y >= this.miny && y <= this.maxy;
        } else {
            return x > this.minx && x < this.maxx && y > this.miny && y < this.maxy;
        }
    }
}

Range2D.fromPoints = function(points) {
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
        return new Range2D({ x: minx, y: miny},{ x: maxx, y:maxy});
    }
}
export default Range2D;
