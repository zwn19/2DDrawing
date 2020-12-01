import "./styles/main.scss";
import Matrix from "./lib/math/Matrix";
import Vector from "./lib/math/geometry/Vector";
import Point from "./lib/math/geometry/Point";
import CoordinateSystem from "./lib/math/geometry/CoordinateSystem";
import PolarCoordinateSystem from "./lib/math/geometry/PolarCoordinateSystem";
import BezierCurve from "./lib/math/geometry/curve/BezierCurve"

import {
    resolveSVG,getSVGElement
} from "./lib/class/Common";
import LineSegment from "./lib/math/geometry/curve/LineSegment";
import Ellipse from "./lib/math/geometry/curve/Ellipse";
import Circle from "./lib/class/Circle";
import Curve, {calculateCrossPoints} from "./lib/math/geometry/curve/index";
import Line from "./lib/math/geometry/curve/Line";
import LineEntity from "./lib/class/Line"
import Rectangle from "./lib/math/2d/Rectangle";
import Polygon from "./lib/class/Polygon";
import Scene from "./lib/class/Scene";
import {isPositivePolarAngle, sortPoints, toDegree} from "./lib/math/utils";
import EllipseCurve from "./lib/math/geometry/curve/Ellipse";
import Range2D from "./lib/math/geometry/Range2D";
import EllipseEntity from "./lib/class/Ellipse";
import EventManager from "./lib/class/plugins/EventManager";

function showPoint({x,y},matrix) {
    let canvas = document.getElementsByTagName("canvas")[0];
    let context = canvas.getContext("2d");
    context.save();
    context.beginPath();
    if (matrix) {
        context.transform.apply(context, matrix.toCSSMatrixArray());
    }
    context.arc(x,y,1,0,2*Math.PI);
    context.closePath();
    context.fillStyle = "red";
    context.fill();
    context.restore();
}

function showLine({start,end},matrix) {
    let canvas = document.getElementsByTagName("canvas")[0];
    let context = canvas.getContext("2d");
    context.save();
    if (matrix) {
        context.transform.apply(context, matrix.toCSSMatrixArray());
    }
    context.beginPath();
    context.moveTo(start.x,start.y);
    context.lineTo(end.x,end.y);
    context.closePath();
    context.strokeStyle = "green";
    context.stroke();
    context.restore();
}

let rootDom = document.getElementsByTagName("svg")[0];
let object = getSVGElement(rootDom.outerHTML);

// object.setChildren([c1,c2,entity1])
console.log(object)
let scene = new Scene(document.getElementById("scene"),object);
let em = new EventManager();
scene.usePlugin(em);
// scene.useCanvasMode();
// scene.useSVGMode();
// scene.addComponent(rect);
scene.draw();
