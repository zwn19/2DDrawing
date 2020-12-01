/* eslint-disable */
import Entity from "./Entity";
import Point from "../math/geometry/Point";
import Path2d from "../math/2d/Path";
import LineSegment from "../math/geometry/curve/LineSegment";
import EllipseCurve from "../math/geometry/curve/Ellipse";
import Circle from "../math/geometry/curve/Circle";
import PolarCoordinateSystem from "../math/geometry/PolarCoordinateSystem";
import Utils from "../math/utils"
import Ellipse from "../math/2d/Ellipse";
import {calculateCrossPoints} from "../math/geometry/curve";

class Path extends Entity{
    constructor(attrs, style) {
        super(attrs, style);
        this.tagName = "path";
        const commands = this._resolvePath(attrs.d);
        this.geometry = new Path2d(commands);
    }

    _resolvePath(pathString) {
        const reg = /([mlvhvcsqtaz])([^mlvhvcsqtaz]*)?/ig;
        const funcs = [];
        let ret = reg.exec(pathString);
        while (ret) {
            const argsStr = ret[2];
            const argReg = /,?(-?\d*\.?\d+)/ig;
            let argRet = argReg.exec(argsStr);
            const args = [];
            while (argRet) {
                args.push(argRet[1]);
                argRet = argReg.exec(argsStr);
            }
            funcs.push({
                name: ret[1],
                args,
            });
            // console.log(ret[1],...args);
            ret = reg.exec(pathString);
        }
        let current = new Point();
        let pathStart;
        const pathCommands = [];
        funcs.forEach((f, index) => {
            switch (f.name) {
                case "M": {
                    for(let i=0;i<f.args.length;i=i+2) {
                        current.set(f.args[i] * 1, f.args[i+1] * 1);
                        pathCommands.push({
                            name: "moveTo",
                            args: [current.copy()],
                        });
                        pathStart = current.copy();
                    }
                    return;
                }
                case "m": {
                    for(let i=0;i<f.args.length;i=i+2) {
                        current.move(f.args[i] * 1, f.args[i+1] * 1);
                        pathCommands.push({
                            name: "moveTo",
                            args: [current.copy()],
                        });
                        pathStart = current.copy();
                    }
                    return;
                }
                case "L": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 2);
                        current.set(args[0] * 1, args[1] * 1);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "l": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 2);
                        current.move(args[0] * 1, args[1] * 1);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "H": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 1);
                        current.set(args[0] * 1, current.y);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "h": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 1);
                        current.move(args[0] * 1);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "V": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 1);
                        current.set(current.x, args[0] * 1);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "v": {
                    while (f.args.length) {
                        const args = f.args.splice(0, 1);
                        current.move(0, args[0] * 1);
                        pathCommands.push({
                            name: "lineTo",
                            args: [current.copy()],
                        });
                    }
                    return;
                }
                case "c": {
                    let _args = [...f.args];
                    while (_args.length) {
                        const arr = _args.splice(0, 6);
                        const ctrl1 = current.copy();
                        const ctrl2 = current.copy();
                        ctrl1.move(arr[0] * 1, arr[1] * 1);
                        ctrl2.move(arr[2] * 1, arr[3] * 1);
                        current.move(arr[4] * 1, arr[5] * 1);
                        pathCommands.push({
                            name: "bezierCurveTo",
                            args: [ctrl1, ctrl2, current.copy()],
                        });
                    }
                    return;
                }
                case "C": {
                    let _args = [...f.args];
                    while (_args.length) {
                        const arr = _args.splice(0, 6);
                        const ctrl1 = new Point(arr[0] * 1, arr[1] * 1);
                        const ctrl2 = new Point(arr[2] * 1, arr[3] * 1);
                        current.set(arr[4] * 1, arr[5] * 1);
                        pathCommands.push({
                            name: "bezierCurveTo",
                            args: [ctrl1, ctrl2, current.copy()],
                        });
                    }
                    return;
                }
                case "s": { // 第一控制点是上一个 c命令的 对称点 或 两个控制点是同一个
                    let _args = [...f.args];
                    while (_args.length) {
                        const args = _args.splice(0, 4);
                        const preFun = funcs[index - 1];
                        const ctrl2 = current.copy();
                        ctrl2.move(args[0], args[1]);
                        let ctrl1;
                        if (["c", "s", "C", "S"].indexOf(preFun.name.toLowerCase()) > -1) { // 计算对称点
                            const preCommand = pathCommands[pathCommands.length - 1];
                            const prectrl = preCommand.args[1];
                            const delta = {
                                x: current.x - prectrl.x,
                                y: current.y - prectrl.y,
                            };
                            ctrl1 = new Point(current.x + delta.x, current.y + delta.y);
                        } else { // 控制点合一
                            ctrl1 = ctrl2.copy();
                        }
                        current.move(args[2] * 1, args[3] * 1);
                        pathCommands.push({
                            name: "bezierCurveTo",
                            args: [ctrl1, ctrl2, current.copy()],
                        });
                    }
                    return;
                }
                case "S": {
                    let _args = [...f.args];
                    while (_args.length) {
                        const args = _args.splice(0, 4);
                        const preFun = funcs[index - 1];
                        const ctrl2 = new Point(args[0], args[1]);
                        let ctrl1;
                        if (["c", "s", "C", "S"].indexOf(preFun.name.toLowerCase()) > -1) { // 计算对称点
                            const preCommand = pathCommands[pathCommands.length - 1];
                            const prectrl = preCommand.args[1];
                            const delta = {
                                x: current.x - prectrl.x,
                                y: current.y - prectrl.y,
                            };
                            ctrl1 = new Point(current.x + delta.x, current.y + delta.y);
                        } else { // 控制点合一
                            ctrl1 = ctrl2.copy();
                        }
                        current.set(args[2] * 1, args[3] * 1);
                        pathCommands.push({
                            name: "bezierCurveTo",
                            args: [ctrl1, ctrl2, current.copy()],
                        });
                    }
                    return;
                }
                case "q": {
                    let _args = [...f.args];
                    while (_args.length) {
                        const args = _args.splice(0, 4);
                        const ctrl1 = current.copy();
                        ctrl1.move(args[0], args[1]);
                        current.move(args[2], args[3]);
                        pathCommands.push({
                            name: "quadraticCurveTo",
                            args: [ctrl1, current.copy()],
                        });
                    }
                    return;
                }
                case "Q": {
                    let _args = [...f.args];
                    while (_args.length) {
                        const args = _args.splice(0, 4);
                        const ctrl1 = new Point(args[0], args[1]);
                        current.set(args[2], args[3]);
                        pathCommands.push({
                            name: "quadraticCurveTo",
                            args: [ctrl1, current.copy()],
                        });
                    }
                    return;
                }
                case "t": { // 未测试
                    const preFun = funcs[index - 1];
                    let ctrl1;
                    current.move(f.args[0], f.args[1]);
                    if (["q", "Q", "t", "T"].indexOf(preFun.name) > -1) { // 计算对称点
                        const preCommand = pathCommands[pathCommands.length - 1];
                        console.log(preCommand);
                        const prectrl1 = preCommand.args[0];
                        const prectrl2 = preCommand.args[1];
                        const delta = {
                            x: prectrl2.x - prectrl1.x,
                            y: prectrl2.y - prectrl1.y,
                        };
                        ctrl1 = new Point(prectrl2.x + delta.x, prectrl2.y + delta.y);
                    } else { // 控制点合一
                        ctrl1 = current.copy();
                    }
                    pathCommands.push({
                        name: "quadraticCurveTo",
                        args: [ctrl1, current.copy()],
                    });
                    return;
                }
                case "T": {
                    const preFun = funcs[index - 1];
                    let ctrl1;
                    current.set(f.args[0], f.args[1]);
                    if (["q", "Q", "t", "T"].indexOf(preFun.name) > -1) { // 计算对称点
                        const preCommand = pathCommands[pathCommands.length - 1];
                        const prectrl1 = preCommand.args[0];
                        const prectrl2 = preCommand.args[1];
                        const delta = {
                            x: prectrl2.x - prectrl1.x,
                            y: prectrl2.y - prectrl1.y,
                        };
                        ctrl1 = new Point(prectrl2.x + delta.x, prectrl2.y + delta.y);
                    } else { // 控制点合一
                        ctrl1 = current.copy();
                    }
                    pathCommands.push({
                        name: "quadraticCurveTo",
                        args: [ctrl1, current.copy()],
                    });
                    return;
                }
                case "a": {
                    let _args = f.args;
                    while (_args.length) {
                        let [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = _args.splice(0, 7).map(i => i * 1);
                        const ctrl = current.copy();
                        current.move(x, y);
                        // 直线
                        if(rx === 0) {
                            pathCommands.push({
                                name: "lineTo",
                                args: [current.copy()],
                            });
                        }
                        // 圆弧
                        else if (Math.abs(rx - ry) <= 0.1) {
                            let radius = rx;
                            let curve = new LineSegment(ctrl, current);
                            let a = curve.length() / 2;
                            let len = Math.sqrt(radius * radius - a * a);
                            let cross = curve.getCenter();
                            let centers = curve.line.getNormalLine(cross).getPointsByPointLength(cross, len);
                            let circle1 = new Circle(centers[0], radius);
                            let circle2 = new Circle(centers[1], radius);
                            let subCircles1 = circle1.splitByPoints([ctrl, current]);
                            let subCircles2 = circle2.splitByPoints([ctrl, current]);
                            let subCircles = [...subCircles1,...subCircles2];
                            if (largeArcFlag) {
                                subCircles = subCircles.filter(c => {
                                    return c.getAbsAngle() > Math.PI;
                                });
                            } else {
                                subCircles = subCircles.filter(c => {
                                    return c.getAbsAngle() < Math.PI;
                                });
                            }
                            let circleCurve;
                            if (sweepFlag) {
                                circleCurve = subCircles.find(c => !c.isReverse(ctrl,current,largeArcFlag));
                            } else {
                                circleCurve = subCircles.find(c => c.isReverse(ctrl,current,largeArcFlag));
                            }
                            let startAngle = circleCurve.getPointAngle(ctrl);
                            let endAngle = circleCurve.getPointAngle(current);
                            let center = circleCurve.getCenter();
                            //svg canvas 画圆弧顺逆时针方向相反
                            pathCommands.push({
                                name: "arc",
                                args: [center.x, center.y, radius, startAngle, endAngle, !sweepFlag],
                            });
                        } else {// 椭圆弧
                            // 椭圆圆心所在椭圆
                            let curve1 = new EllipseCurve(current,rx,ry);
                            let curve2 = new EllipseCurve(ctrl,rx,ry);
                            let _centers = calculateCrossPoints(curve1,curve2);
                            let ellipse1 = new EllipseCurve(_centers[0], rx,ry);
                            let ellipse2 = new EllipseCurve(_centers[1], rx,ry);
                            let subCurve1 = ellipse1.splitByPoints([ctrl, current]);
                            let subCurve2 = ellipse2.splitByPoints([ctrl, current]);
                            let subCurves = [...subCurve1,...subCurve2];
                            if (largeArcFlag) {
                                subCurves = subCurves.filter(c => {
                                    return c.getAbsAngle() > Math.PI;
                                });
                            } else {
                                subCurves = subCurves.filter(c => {
                                    return c.getAbsAngle() < Math.PI;
                                });
                            }
                            let circleCurve;
                            if (sweepFlag) {
                                circleCurve = subCurves.find(c => !c.isReverse(ctrl,current,largeArcFlag));
                            } else {
                                circleCurve = subCurves.find(c => c.isReverse(ctrl,current,largeArcFlag));
                            }
                            circleCurve.generatePoints().forEach(p => {
                                pathCommands.push({
                                    name: "lineTo",
                                    args: [p],
                                });
                            });
                        }
                    }
                    return;
                }
                case "A": {
                    let _args = [...f.args];
                    while (_args.length) {
                        let [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = _args.splice(0, 7).map(i => i * 1);
                        const ctrl = current.copy();
                        current.set(x, y);
                        if(rx === 0) {
                            pathCommands.push({
                                name: "lineTo",
                                args: [current.copy()],
                            });
                        }
                        // 圆弧
                        else if (Math.abs(rx - ry) <= 0.1) {
                            let radius = rx;
                            let curve = new LineSegment(ctrl, current);
                            let a = curve.length() / 2;
                            let len = Math.sqrt(radius * radius - a * a);
                            let cross = curve.getCenter();
                            let centers = curve.line.getNormalLine(cross).getPointsByPointLength(cross, len);
                            let circle1 = new Circle(centers[0], radius);
                            let circle2 = new Circle(centers[1], radius);
                            let subCircles1 = circle1.splitByPoints([ctrl, current]);
                            let subCircles2 = circle2.splitByPoints([ctrl, current]);
                            let subCircles = [...subCircles1,...subCircles2];
                            if (largeArcFlag) {
                                subCircles = subCircles.filter(c => {
                                   return c.getAbsAngle() > Math.PI;
                                });
                            } else {
                                subCircles = subCircles.filter(c => {
                                    return c.getAbsAngle() < Math.PI;
                                });
                            }
                            let circleCurve;
                            if (sweepFlag) {
                                circleCurve = subCircles.find(c => !c.isReverse(ctrl,current,largeArcFlag));
                            } else {
                                circleCurve = subCircles.find(c => c.isReverse(ctrl,current,largeArcFlag));
                            }
                            let startAngle = circleCurve.getPointAngle(ctrl);
                            let endAngle = circleCurve.getPointAngle(current);
                            let center = circleCurve.getCenter();
                            //svg canvas 画圆弧顺逆时针方向相反
                            pathCommands.push({
                                name: "arc",
                                args: [center.x, center.y, radius, startAngle, endAngle, !sweepFlag],
                            });
                        } else {// 椭圆弧
                            // 椭圆圆心所在椭圆
                            let curve1 = new EllipseCurve(current,rx,ry);
                            let curve2 = new EllipseCurve(ctrl,rx,ry);
                            let _centers = calculateCrossPoints(curve1,curve2);
                            let ellipse1 = new EllipseCurve(_centers[0], rx,ry);
                            let ellipse2 = new EllipseCurve(_centers[1], rx,ry);
                            let subCurve1 = ellipse1.splitByPoints([ctrl, current]);
                            let subCurve2 = ellipse2.splitByPoints([ctrl, current]);
                            let subCurves = [...subCurve1,...subCurve2];
                            if (largeArcFlag) {
                                subCurves = subCurves.filter(c => {
                                    return c.getAbsAngle() > Math.PI;
                                });
                            } else {
                                subCurves = subCurves.filter(c => {
                                    return c.getAbsAngle() < Math.PI;
                                });
                            }
                            let circleCurve;
                            if (sweepFlag) {
                                circleCurve = subCurves.find(c => !c.isReverse(ctrl,current,largeArcFlag));
                            } else {
                                circleCurve = subCurves.find(c => c.isReverse(ctrl,current,largeArcFlag));
                            }
                            circleCurve.generatePoints().forEach(p => {
                                pathCommands.push({
                                    name: "lineTo",
                                    args: [p],
                                });
                            });
                        }
                    }
                    return;
                }
                case "z": {
                    current = pathStart;
                    pathCommands.push({
                        name: "closePath",
                    });
                    return;
                }
                case "Z": {
                    current = pathStart;
                    pathCommands.push({
                        name: "closePath",
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return pathCommands;
    }

    drawPath(context) {
        context.beginPath();
        this.geometry.commands.forEach((c) => {
            switch (c.name) {
                case "moveTo": {
                    const p = c.args[0];
                    context.moveTo(p.x, p.y);
                    return;
                }
                case "lineTo": {
                    const p = c.args[0];
                    context.lineTo(p.x, p.y);
                    return;
                }
                case "bezierCurveTo": {
                    const p = c.args[0];
                    const p1 = c.args[1];
                    const p2 = c.args[2];
                    context.bezierCurveTo(p.x, p.y, p1.x, p1.y, p2.x, p2.y);
                    return;
                }
                case "quadraticCurveTo": {
                    const p = c.args[0];
                    const p1 = c.args[1];
                    context.quadraticCurveTo(p.x, p.y, p1.x, p1.y);
                    return;
                }
                case "arc": {
                    let [cx, cy, radius, startAngle = 0, endAngle = Math.PI * 2,flag] = c.args;
                    context.arc(cx,cy,radius,startAngle,endAngle,!!flag);
                    return;
                }
                case "closePath": {
                    context.closePath();
                }
            }
        });
    }
}

function svgArcToCenterParam(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
    let
        deltaAngle,
        endAngle;
    const PIx2 = Math.PI * 2.0;

    if (rx < 0) {
        rx = -rx;
    }
    if (ry < 0) {
        ry = -ry;
    }
    if (rx == 0.0 || ry == 0.0) { // invalid arguments
        throw Error('rx and ry can not be 0');
    }

    const sPhi = Math.sin(phi);
    const cPhi = Math.cos(phi);
    const hdX = (x1 - x2) / 2.0; // half diff of x
    const hdY = (y1 - y2) / 2.0; // half diff of y
    const hsX = (x1 + x2) / 2.0; // half sum of x
    const hsY = (y1 + y2) / 2.0; // half sum of y

    // F6.5.1
    const x1_ = cPhi * hdX + sPhi * hdY;
    const y1_ = cPhi * hdY - sPhi * hdX;

    // F.6.6 Correction of out-of-range radii
    //   Step 3: Ensure radii are large enough
    const lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }

    const rxry = rx * ry;
    const rxy1_ = rx * y1_;
    const ryx1_ = ry * x1_;
    const sumOfSQ = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
    if (!sumOfSQ) {
        throw Error('start point can not be same as end point');
    }
    let coe = Math.sqrt(Math.abs((rxry * rxry - sumOfSQ) / sumOfSQ));
    if (fA == fS) {
        coe = -coe;
    }

    // F6.5.2
    const cx_ = coe * rxy1_ / ry;
    const cy_ = -coe * ryx1_ / rx;

    // F6.5.3
    const cx = cPhi * cx_ - sPhi * cy_ + hsX;
    const cy = sPhi * cx_ + cPhi * cy_ + hsY;

    const xcr1 = (x1_ - cx_) / rx;
    const xcr2 = (x1_ + cx_) / rx;
    const ycr1 = (y1_ - cy_) / ry;
    const ycr2 = (y1_ + cy_) / ry;

    // F6.5.5
    const startAngle = radian(1.0, 0.0, xcr1, ycr1);

    // F6.5.6
    deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
    while (deltaAngle > PIx2) {
        deltaAngle -= PIx2;
    }
    while (deltaAngle < 0.0) {
        deltaAngle += PIx2;
    }
    if (fS == false || fS == 0) {
        deltaAngle -= PIx2;
    }
    endAngle = startAngle + deltaAngle;
    while (endAngle > PIx2) {
        endAngle -= PIx2;
    }
    while (endAngle < 0.0) {
        endAngle += PIx2;
    }

    const outputObj = {
        cx,
        cy,
        startAngle,
        deltaAngle,
        endAngle,
        clockwise: (fS == true || fS == 1),
    };
    return outputObj;
}
export default Path;
