import axios from 'axios'
import {
    resolveSVG,getSVGElement
} from "./lib/class/Common";
import Circle from "./lib/class/Circle";
import LineEntity from "./lib/class/Line"
import Scene from "./lib/class/Scene";
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
axios.get('/static/篮球场.svg').then(res => {
    let svg = res.data;
    let object = getSVGElement(svg);
    let scene = new Scene(document.getElementById("scene"),object);
    let em = new EventManager();
    scene.usePlugin(em);
    let testCmp = scene.getLayer().root.getFirstChild((cmp) => {
        return cmp.getProps('id') === '106_zone';
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

    em.registerMovable(testCmp)
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
    let svgBtn = document.getElementById('svg-btn');
    let canBtn = document.getElementById('canvas-btn');
    let indexBtn = document.getElementById('index-btn');

    svgBtn.addEventListener('click', () => {
        scene.useSVGMode();
        scene.draw();
    });
    canBtn.addEventListener('click', () => {
        scene.useCanvasMode();
        scene.draw();
    });
    indexBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
