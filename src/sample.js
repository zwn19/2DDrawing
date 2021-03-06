// import "./styles/main.scss";
import Matrix from "./lib/math/Matrix";
import Vector from "./lib/math/geometry/base/Vector";
import Point from "./lib/math/geometry/base/Point";
import CoordinateSystem from "./lib/math/geometry/base/CoordinateSystem";
import PolarCoordinateSystem from "./lib/math/geometry/base/PolarCoordinateSystem";
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
import Polygon from "./lib/class/Polygon";
import Scene from "./lib/class/Scene";
import {isPositivePolarAngle, sortPoints, toDegree} from "./lib/math/utils";
import EllipseCurve from "./lib/math/geometry/curve/Ellipse";
import Range2D from "./lib/math/geometry/base/Range2D";
import EllipseEntity from "./lib/class/Ellipse";
import EventManager from "./lib/class/plugins/EventManager";
import Rectangle from "./lib/class/Rectangle";

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

let scene = new Scene(document.getElementById("scene"),object);
let em = new EventManager();
scene.usePlugin(em);
let testCmp = scene.getLayer().root.getFirstChild((cmp) => {
    return cmp.getProps('floorid') === '1987581';
})

let points = testCmp.getPoints();
points.forEach(p => {
    let circle = new Circle({
        cx: p.x,
        cy: p.y,
        r: 4
    },{
        fill: "green"
    })
    scene.addComponent(circle);
});
testCmp.getBoundaries().forEach(line => {
    let {
        start,end
    } = line;
    let _line = new LineEntity({
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y
    },{
        stroke: "green"
    })
    scene.addComponent(_line);
});


em.wholeMovable();
em.addTooltip(testCmp, 'x,y');
// em.registerMovable(testCmp)
scene.useCanvasMode();
scene.useSVGMode();
scene.draw();

function showPoint2({x,y}) {
    let circle = new Circle({
        cx: x,
        cy: y,
        r: 10,
        fill: "green"
    });
    scene.getLayer().root.addChild(circle);
    scene.draw();
}
function showLine2({start,end}) {
    let circle = new LineEntity({
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        stroke: "blue"
    });
    scene.getLayer().root.addChild(circle)
    scene.draw();
}
window.showPoint2 = showPoint2;
window.showLine2 = showLine2;
