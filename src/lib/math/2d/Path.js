/* eslint-disable */

import BezierCurve from "../geometry/curve/BezierCurve";
import LineSegment from "../geometry/curve/LineSegment";
import Circle from "../geometry/curve/Circle";
import Ellipse from "../geometry/curve/Ellipse";
import UniqueArray from "../../utils/UniqueArray";
import Polygon from "./Polygon";
import Utils, {getPointsCenter} from "../utils";
import Point from "../geometry/Point";


class Path {
    constructor(commands) {
        let curves = [];
        let currentPoint,startPoint;
        commands.forEach((c, index) => {
            const { args } = c;
            if (c.name === "moveTo") {
                startPoint = args[0];
                currentPoint = args[args.length-1];
            } else if (c.name === "bezierCurveTo") {
                curves.push(new BezierCurve([currentPoint, ...c.args]));
                currentPoint = args[args.length-1];
            } else if (c.name === "quadraticCurveTo") {
                curves.push(new BezierCurve([currentPoint, ...c.args]));
                currentPoint = args[args.length-1];
            } else if (c.name === "lineTo"){
                const { args } = c;
                curves.push(new LineSegment(currentPoint,args[0]));
                currentPoint = args[args.length-1];
            }else if(c.name === "closePath" && !currentPoint.equals(startPoint)) {
                curves.push(new LineSegment(currentPoint,startPoint));
            }else if(c.name === "arc") {
                let [cx, cy, radius, startAngle, endAngle] = args;
                let circle = new Circle({x:cx,y:cy},radius,startAngle,endAngle - startAngle);
                curves.push(circle);
                currentPoint = circle.getPointByAngle(endAngle);
            }
        });
        this.curves = curves;
        this.commands = commands;
    }
    length() {
        let sum = 0;
        this.curves.forEach(c => {
            sum += c.length();
        });
        return sum;
    }
    getCenter() {
        return getPointsCenter(this.getPoints());
    }
    getPoints() {
        let array = new UniqueArray();
        this.curves.forEach(c => {
            if (c instanceof LineSegment) {
                array.push(c.start);
                array.push(c.end);
            } else {
                let points = c.generatePoints();
                array.push.apply(array, points);
            }
        });
        return array;
    }
    getLines() {
        let array = new UniqueArray();
        this.curves.forEach(c => {
            if (c instanceof LineSegment) {
                array.push(c);
            } else {
                let lines = c.generateLineSegments();
                array.push.apply(array, lines);
            }
        });
        return array;
    }
    applyMatrix(matrix) {
        let commands = this.commands;
        let _commands = [];
        commands.forEach(cmd => {
            _commands.push({
                name: cmd.name,
                args: cmd.args.map(p => p.applyMatrix(matrix))
            });
        });
        return new Path(_commands);
    }
}
export default Path;
