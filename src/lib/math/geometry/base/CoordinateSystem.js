/* eslint-disable */
import Matrix from "../../Matrix"
import Point from "./Point";
class CoordinateSystem {
    constructor(matrix = Matrix.init(3)) {
        this.matrix = matrix;
    }
    applyMatrix(matrix) {
        this.matrix = this.matrix.multiply(matrix);
    }
    updateMatrix(matrix) {
        this.matrix = matrix;
    }
    getPointFromOriginSystem(point) {
        let p = Point.applyMatrixToPoint(point, this.matrix.getInverse());
        return p;
    }
    getPointInOriginSystem(point) {
        let p = Point.applyMatrixToPoint(point, this.matrix);
        return p;
    }
    getPointFromGivenSystem(point,system) {
        let origin = system.getPointInOriginSystem(point);
        return this.getPointFromOriginSystem(origin);
    }
    getPointInGivenSystem(point,system) {
        let origin = this.getPointInOriginSystem(point);
        return system.getPointFromOriginSystem(origin);
    }
    _rotateMatrix(xAngle,yAngle) {
        xAngle = xAngle / 180 * Math.PI;
        yAngle = yAngle / 180 * Math.PI;
        let arr = [
            [Math.cos(xAngle),Math.sin(xAngle),0],
            [-Math.sin(yAngle),Math.cos(yAngle),0],
            [0,0,1]
        ];
        let matrix = new Matrix(arr);
        return matrix;
    }
    rotateXYAxis(xAngle = 0,yAngle = 0) {
        let matrix = this._rotateMatrix(xAngle,yAngle);
        this.matrix = matrix.multiply(this.matrix);
    }
    rotateRelativeXYAxis(xAngle = 0,yAngle = 0) {
        let matrix = this._rotateMatrix(xAngle,yAngle);
        this.matrix = this.matrix.multiply(matrix);
    }
    translateXYAxis(translateX = 0,translateY = 0) {
        let matrix = Matrix.translate(translateX,translateY);
        this.matrix = matrix.multiply(this.matrix);
    }
    translateRelativeXYAxis(translateX = 0,translateY = 0) {
        let matrix = Matrix.translate(translateX,translateY);
        this.matrix = this.matrix.multiply(matrix);
    }
    scaleXYUnit(scaleX = 1,scaleY = 1) {
        let m = Matrix.scale(scaleX,scaleY,{x:0,y:0});
        this.matrix = m.multiply(this.matrix);
    }
}
export default CoordinateSystem;
