/* eslint-disable */
import Matrix from "../Matrix";
import Point from "./Point";
class PolarCoordinateSystem {
    constructor(center,xyRatio) {
        if (!xyRatio) {
            xyRatio = 1;
        }
        this.xyRatio = xyRatio;
        this.matrix = Matrix.init(3);
        this.translateXYAxis(center.x, center.y);
    }
    applyMatrix(matrix) {
        this.matrix = this.matrix.multiply(matrix);
    }
    getPointFromOriginSystem({x,y}) {
        let p = Point.applyMatrixToPoint({x,y}, this.matrix.getInverse());
        if (p.x === 0 && p.y === 0) {
            return {
                theta: 0,
                radius: 0
            }
        }
        p.x = p.x / this.xyRatio;
        let theta = Math.atan(p.y/p.x);
        if (p.x < 0) {
            theta = theta + Math.PI;
        }
        if (theta < 0) {
            theta = theta + Math.PI * 2;
        }
        let radius = Point.distance(p, Point.zeroPoint());
        return { theta, radius };
    }
    getPointInOriginSystem({ radius , theta}) {
        let x = radius * Math.cos(theta);
        let y = radius * Math.sin(theta) / this.xyRatio;
        let p = Point.applyMatrixToPoint({x,y}, this.matrix);
        return p;
    }
    rotateXYAxis(xAngle = 0,yAngle = 0) {
        xAngle = xAngle / 180 * Math.PI;
        yAngle = yAngle / 180 * Math.PI;
        let arr = [
            [Math.cos(xAngle),Math.sin(xAngle),0],
            [-Math.sin(yAngle),Math.cos(yAngle),0],
            [0,0,1]
        ];
        let matrix = new Matrix(arr);
        this.matrix = matrix.multiply(this.matrix);
    }
    translateXYAxis(translateX = 0,translateY = 0) {
        let matrix = Matrix.translate(translateX,translateY);
        this.matrix = matrix.multiply(this.matrix);
    }
    scaleXYUnit(scaleX = 1,scaleY = 1) {
        let m = Matrix.scale(scaleX,scaleY,{x:0,y:0});
        this.matrix = m.multiply(this.matrix);
    }
}
export default PolarCoordinateSystem;
