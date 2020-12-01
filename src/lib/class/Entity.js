/* eslint-disable */
import Element from "./Element";
import Color from "../utils/Color";
import {getPointsCenter, pushToArray} from "../math/utils";
import Ray from "../math/geometry/curve/Ray";

class Entity extends Element{
    constructor(attrs,style) {
        super(attrs,style);
    }
    getCrossPoints(entity) {
        let lines1 = this.getBoundaries();
        let lines2 = entity.getBoundaries();
        let points = [];
        lines1.forEach(l1 => {
            let lineFormular = l1;
            lines2.forEach(l2 => {
                let p = lineFormular.getCrossPoint(l2);
                if (p) {
                    points.push(p);
                }
            });
        });
        return points;
    }
    getGeometry() {
        return this.geometry.applyMatrix(this.getMatrix());
    }
    getCenter() {
        let points = this.getPoints();
        return getPointsCenter(points);
    }
    getPoints() {
        let points = this.getGeometry().getPoints();
        return points;
    }
    getBoundaries() {
        let lines = this.getGeometry().getLines();
        return lines;
    }
    isInArea({x,y}) {
        // 射线法判断是否在多边形内
        let lines = this.getBoundaries();
        const _zero = { x: -10000 * Math.random(), y: -10000 * Math.random() };
        const line = new Ray({x,y},_zero);
        let crossPoints = [];
        lines.forEach(l => {
            let point = l.getCrossPoint(line);
            if (point) {
                pushToArray(crossPoints, point);
            }
        });
        return crossPoints.length % 2;
    }
    drawPath(context) {
        let points = this.geometry.getPoints();
        context.beginPath();
        points.forEach((p,i) => {
            if (i === 0) {
                context.moveTo(p.x,p.y);
            }
            context.lineTo(p.x,p.y);
        });
        context.closePath();
    }
    toCanvas(context) {
        let m = this.getCurrentMatrix();
        let run = () => {
            context.save();
            context.transform.apply(context, m.toCSSMatrixArray());
            let fill = this.getStyle("fill");
            let opacity = this.getStyle("opacity");
            if (opacity) {
                context.globalAlpha = opacity;
            }
            let stroke = this.getStyle("stroke");
            let strokeWidth = this.getStyle("stroke-width");
            if (stroke && stroke !== "none") {
                let opacity = this.getStyle("stroke-opacity") || 1;
                context.strokeStyle = Color.composeColorOpacity(stroke,opacity);
                context.lineWidth = strokeWidth;
                context.stroke();
            }
            if (fill && fill !== "none" && fill !== "transparent") {
                let opacity = this.getStyle("fill-opacity") || 1;
                context.fillStyle = Color.composeColorOpacity(fill,opacity);;
                context.fill();
            }
            context.restore();
        }
        let promise = this.drawPath(context);
        if (promise) {
            promise.then(() => {
                run();
            });
        } else {
            run();
        }
    }
}
export default Entity;
