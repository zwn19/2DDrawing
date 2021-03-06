import {getSVGElement} from "./lib/class/Common";
import Scene from "./lib/class/Scene";
import EventManager from "./lib/class/plugins/EventManager";
import Circle from "./lib/class/Circle";
import CoordinateSystem from "./lib/math/geometry/base/CoordinateSystem";
import Line from "./lib/class/Line";
import Text from "./lib/class/Text";
import Matrix from "./lib/math/Matrix";
import Point from "./lib/math/geometry/base/Point";

let cont = document.getElementById("scene");
let sampleDots =
    '235,591;216,539;148,413;35,310;85,308;204,519;49,325;25,332;173,498;' +
    '191,498;134,392;99,334;117,385;112,387;162,425;272,659;159,400;159,427;' +
    '59,319;198,522;';
sampleDots = sampleDots.split(';').filter(p =>p).map((p) => {
    let arr = p.split(',');
    return {
        x: arr[0] * 1,
        y: arr[1] * 1
    }
});
const ETA = 0.001;
function mean(nums) {
    let sum = 0;
    nums.forEach(num => {
        sum += num;
    });
    return sum / nums.length;
}
function sigma(nums) {
    let _miu = mean(nums);
    let sum = 0;
    nums.forEach(num => {
        sum += (num - _miu) * (num - _miu);
    });
    sum = sum / nums.length;
    return Math.sqrt(sum);
}

let getStandardize = function (arr) {
    let miu = mean(arr);
    let _sigma = sigma(arr)
    return function (x) {
        return (x - miu) / _sigma;
    }
};

class CoordinateSystemDisplay {
    // options: {xUnit,yUnit,xMin,yMin,xGraduation,yGraduation,offsetY,offsetX}
    constructor(container, options = {}) {
        let width = container.offsetWidth;
        let height = container.offsetHeight;
        let {origin = {x:width/2,y:height/2},xUnit = 1,yUnit = 1,xGraduation,yGraduation,offsetY,offsetX} = options;
        let root = getSVGElement(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`);
        let scene = new Scene(container,root);
        scene.useCanvasMode();
        let em = new EventManager();
        scene.usePlugin(em);
        this.scene = scene;
        let coord = new CoordinateSystem();
        coord.rotateXYAxis(0,180);
        coord.translateXYAxis(origin.x,-origin.y);
        coord.scaleXYUnit(xUnit,yUnit);
        this.coord = coord;
        this.unit = {
            x: xUnit,
            y: yUnit
        }
        let p1 = coord.getPointFromOriginSystem({x:0,y:0});
        let p2 = coord.getPointFromOriginSystem({x:width,y:0});
        let p3 = coord.getPointFromOriginSystem({x:width,y:height});
        let p4 = coord.getPointFromOriginSystem({x:0,y:height});
        let xMin = Math.min(p1.x,p2.x,p3.x,p4.x);
        let yMin = Math.min(p1.y,p2.y,p3.y,p4.y);
        let xMax = Math.max(p1.x,p2.x,p3.x,p4.x);
        let yMax = Math.max(p1.y,p2.y,p3.y,p4.y);
        this.size = {
            xMin,
            yMin,
            xMax,
            yMax
        };
        this._drawAxis();
        if(xGraduation && yGraduation) {
            this._drawGraduation(xGraduation , yGraduation);
        }
        scene.draw();
    }
    refresh() {
        this.scene.draw();
    }
    _drawGraduation(xGraduation , yGraduation) {
        let current = 0;
        let {
            xMin,
            yMin,
            xMax,
            yMax
        } = this.size;
        while (current < xMax) {
            let xPoint1 = this.coord.getPointInOriginSystem({x:current,y:0});
            let xPoint2 = {x:xPoint1.x,y:xPoint1.y-5};
            this._drawLine(xPoint1,xPoint2);
            this._drawText(current,{x:xPoint1.x - `${current}`.length * 5,y:xPoint1.y + 15});
            current += xGraduation;
        }
        current = -xGraduation;
        while (current > xMin) {
            let xPoint1 = this.coord.getPointInOriginSystem({x:current,y:0});
            let xPoint2 = {x:xPoint1.x,y:xPoint1.y-5};
            this._drawLine(xPoint1,xPoint2);
            this._drawText(current,{x:xPoint1.x - `${current}`.length * 5,y:xPoint1.y + 15});
            current -= xGraduation;
        }
        // y轴
        current = 0;
        while (current < yMax) {
            let xPoint1 = this.coord.getPointInOriginSystem({x:0,y:current});
            let xPoint2 = {x:xPoint1.x + 5,y:xPoint1.y};
            this._drawLine(xPoint1,xPoint2);
            this._drawText(current,{x:xPoint1.x - `${current}`.length * 9,y:xPoint1.y + 5});
            current += yGraduation;
        }
        current = -yGraduation;
        while (current > yMin) {
            let xPoint1 = this.coord.getPointInOriginSystem({x:0,y:current});
            let xPoint2 = {x:xPoint1.x + 5,y:xPoint1.y};
            this._drawLine(xPoint1,xPoint2);
            this._drawText(current,{x:xPoint1.x - `${current}`.length * 9,y:xPoint1.y + 5});
            current -= yGraduation;
        }
    }
    _drawAxis() {
        // 原点
        let originPoint = this.coord.getPointInOriginSystem({x:0,y:0});
        this._drawDot(originPoint);
        // 坐标系
        let xAxisPointMin = this.coord.getPointInOriginSystem({x:this.size.xMin,y:0});
        let xAxisPointMax = this.coord.getPointInOriginSystem({x:this.size.xMax,y:0});
        this._drawLine(xAxisPointMin,xAxisPointMax);
        let yAxisPointMin = this.coord.getPointInOriginSystem({x:0,y:this.size.yMin});
        let yAxisPointMax = this.coord.getPointInOriginSystem({x:0,y:this.size.yMax});
        this._drawLine(yAxisPointMin,yAxisPointMax);
        // 坐标系箭头
        let m1 = Matrix.rotate(20 / 180 * Math.PI, xAxisPointMax);
        let xAxisArrowEnd1 = new Point(xAxisPointMax.x - 10,xAxisPointMax.y);
        xAxisArrowEnd1 = xAxisArrowEnd1.applyMatrix(m1);
        this._drawLine(xAxisPointMax,xAxisArrowEnd1);
        m1 = Matrix.rotate(-20 / 180 * Math.PI, xAxisPointMax);
        let xAxisArrowEnd2 = new Point(xAxisPointMax.x - 10,xAxisPointMax.y);
        xAxisArrowEnd2 = xAxisArrowEnd2.applyMatrix(m1);
        this._drawLine(xAxisPointMax,xAxisArrowEnd2);
        this._drawText('X',{x:xAxisPointMax.x - 12,y:xAxisPointMax.y + 18});

        let m2 = Matrix.rotate(20 / 180 * Math.PI, yAxisPointMax);
        let yAxisArrowEnd1 = new Point(yAxisPointMax.x,yAxisPointMax.y + 10);
        yAxisArrowEnd1 = yAxisArrowEnd1.applyMatrix(m2);
        this._drawLine(yAxisPointMax,yAxisArrowEnd1);
        m2 = Matrix.rotate(-20 / 180 * Math.PI, yAxisPointMax);
        let yAxisArrowEnd2 = new Point(yAxisPointMax.x,yAxisPointMax.y + 10);
        yAxisArrowEnd2 = yAxisArrowEnd2.applyMatrix(m2);
        this._drawLine(yAxisPointMax,yAxisArrowEnd2);
        this._drawText('Y',{x:yAxisPointMax.x - 14,y:yAxisPointMax.y + 14});
        // 坐标系上点
    }
    _drawText(text,{x,y},color = '#000') {
        let txt = new Text({
            x,y,fill:color
        },{},text);
        this.scene.addComponent(txt);
    }
    _drawDot({x,y},fill='#000') {
        let p = new Circle({
            cx: x,
            cy: y,
            r: 2,
            fill
        });
        this.scene.addComponent(p);
    }
    _drawLine({x:x1,y:y1},{x:x2,y:y2},stroke = '#000') {
        let line = new Line({x1,x2,y1,y2,stroke});
        this.scene.addComponent(line);
    }
    drawDot({x,y},color) {
        let p = this.coord.getPointInOriginSystem({x,y});
        this._drawDot(p,color);
    }
    drawLine({x:x1,y:y1},{x:x2,y:y2},color) {
        let p1 = this.coord.getPointInOriginSystem({x:x1,y:y1});
        let p2 = this.coord.getPointInOriginSystem({x:x2,y:y2});
        this._drawLine(p1,p2,color);
    }
    drawText(text,{x,y},color ) {
        let p = this.coord.getPointInOriginSystem({x,y});
        this._drawText(text,p,color);
    }
    drawFunction(f,step,min,max) {
        let {
            xMin,
            xMax,
        } = this.size;
        min = min !== undefined ? min : xMin;
        max = max !== undefined ? max : xMax;
        for(let i = min;i <= max;i+=step) {
            let start = {x:i};
            let end = {x:i+step};
            start.y = f(start.x);
            end.y = f(end.x);
            this.drawLine(start,end,'green');
        }
        this.refresh();
    }
}
let REGISTERS = {
    SteepestDescent,
    PolynomialRegression,
    Perceptron,
    LogicRegress
}
for (let id in REGISTERS){
    let dom = document.getElementById(id);
    if (dom) {
        dom.addEventListener('click',() => {
            cont.innerHTML = '';
            REGISTERS[id]();
        });
    }
}
// 最速下降法
function SteepestDescent (){
    let theta0 = 10;
    let theta1 = 10;
    let diff = 1;
    let sysDisplay = new CoordinateSystemDisplay(cont, {
        xGraduation: 50,
        yGraduation: 50,
        origin: {
            x: 30,
            y: cont.offsetHeight - 20
        }
    });
    let xArr = sampleDots.map(p => p.x);
    let standardize = getStandardize(xArr);
    let _sampleDots = sampleDots.map(p => {
        let {x,y} = p;
        let _x = standardize(x);
        return {
            x: _x,
            y,
        }
    });
    sampleDots.forEach(p => {
        sysDisplay.drawDot(p,'red');
    });
    sysDisplay.refresh();
    let currentError = E();
    function f(x) {
        return theta0 + theta1 * x;
    }
    function E() {
        let sum = 0;
        _sampleDots.forEach(({x,y}) => {
            sum += (f(x) - y) * (f(x) - y);
        });
        return 0.5 * sum;
    }
    function cal() {
        let sum0 = 0;
        _sampleDots.forEach(({x,y}) => {
            sum0 += (f(x) - y)
        });
        let sum1 = 0;
        _sampleDots.forEach(({x,y}) => {
            sum1 += (f(x) - y) * x;
        });
        let tem0 = theta0 - ETA * sum0;
        let tem1 = theta1 - ETA * sum1;
        theta0 = tem0;
        theta1 = tem1;
        let error = E();
        diff = Math.abs(error - currentError);
        currentError = error;
    }
    while (diff > 0.001) {
        cal();
    }
    let start = {x:0};
    let end = {x:300};
    start.y = f(standardize(start.x));
    end.y = f(standardize(end.x));
    sysDisplay.drawLine(start,end,'green');
    sysDisplay.refresh();
};
// 多项式回归
function PolynomialRegression() {
    let theta = new Matrix([[10,10,10]]);
    let diff = 1;
    let sysDisplay = new CoordinateSystemDisplay(cont, {
        xGraduation: 50,
        yGraduation: 50,
        origin: {
            x: 30,
            y: cont.offsetHeight - 20
        }
    });
    sampleDots.forEach(p => {
        sysDisplay.drawDot(p,'red');
    });
    sysDisplay.refresh();
    let xArr = sampleDots.map(p => p.x);
    let standardize = getStandardize(xArr);
    let _sampleDots = sampleDots.map(p => {
        let {x,y} = p;
        let _x = standardize(x);
        return {
            x: _x,
            y,
        }
    });
    let currentError = E();
    function f(x) {
        let m = new Matrix([[1,x,x*x]]).transpose();
        let result = theta.multiply(m);
        return result.data[0];
    }
    function E() {
        let sum = 0;
        _sampleDots.forEach(({x,y}) => {
            sum += (f(x) - y) * (f(x) - y);
        });
        return 0.5 * sum;
    }
    function cal() {
        let fMatrix = new Matrix([_sampleDots.map(p => {
            return f(p.x) - p.y;
        })]);
        let m0 = new Matrix([_sampleDots.map(p => {
            return 1;
        })]).transpose();
        let m1 = new Matrix([_sampleDots.map(p => {
            return p.x;
        })]).transpose();
        let m2 = new Matrix([_sampleDots.map(p => {
            return p.x * p.x;
        })]).transpose();
        let theta0 = theta.get(0,0) - ETA * fMatrix.multiply(m0).data[0];
        let theta1 = theta.get(0,1) - ETA * fMatrix.multiply(m1).data[0];
        let theta2 = theta.get(0,2) - ETA * fMatrix.multiply(m2).data[0];
        theta = new Matrix([[theta0,theta1,theta2]]);
        let error = E();
        diff = Math.abs(error - currentError);
        currentError = error;
        console.log(theta0,theta1,theta2,diff);
    }
    while (diff > 0.001) {
        cal();
    }
    sysDisplay.drawFunction(function(x) {
        return f(standardize(x));
    },10);
};
// 感知机 perceptron
const perceptronData = '210,200,-1;153,432,-1;220,262,-1;118,214,-1;474,384,1;485,411,1;233,430,-1;396,361,1;' +
    '484,349,1;429,259,1;286,220,1;399,433,-1;403,340,1;252,34,1;497,472,1;379,416,-1;76,163,-1;263,112,1;26,193,-1;61,473,-1;420,253,1;';
function Perceptron() {
    let sysDisplay = new CoordinateSystemDisplay(cont, {
        xGraduation: .5,
        yGraduation: .5,
        xUnit: 120,
        yUnit: 130,
        xMin: -2,
        yMin: -3
    });
    let dots = perceptronData.split(';').filter(p => p).map(pair => {
        let arr = pair.split(',');
        return {
            x1: arr[0] * 1,
            x2: arr[1] * 1,
            y: arr[2] * 1
        };
    });
    let array1 = dots.map(d => d.x1);
    let array2 = dots.map(d => d.x2);
    let standardize1 = getStandardize(array1);
    let standardize2 = getStandardize(array2);
    let _dots = dots.map(d => {
        let _d = {...d};
        _d.x1 = standardize1(_d.x1);
        _d.x2 = standardize2(_d.x2);
        return _d;
    });
    _dots.forEach(pair => {
        if(pair.y === 1) {
            sysDisplay.drawDot({
                x: pair.x1,
                y: pair.x2
            },'green');
        } else {
            sysDisplay.drawDot({
                x: pair.x1,
                y: pair.x2
            },'red');
        }
    });
    sysDisplay.refresh();
    let W = new Matrix([[10,10]]);
    function f(xMatrix) {
        let ret = W.multiply(xMatrix.transpose()).data[0];
        if (ret >= 0) {
            return 1
        }
        return -1;
    }
    console.log(dots);
    function cal() {
        dots.forEach(({x1,x2,y}) => {
            let m = new Matrix([[x1,x2]]);
            let ret = f(m);
            if (ret !== y) {
                W = W.plusMatrix(m.multiplyNumber(y));
            }
        });
    }
    for(let i=0;i<5000;i++) {
        cal();
    }
    console.log(W.data);
    console.log(f(new Matrix([[100,200]])))
    function _line(x) {
        let [x1,x2] = W.data;
        return -x1 / x2 * x;
    }
    sysDisplay.drawLine({x:-2,y:-2},{x:2,y:_line(2)},'#9945ff');
    sysDisplay.refresh();
};
// 逻辑回归
function LogicRegress(){
    let sysDisplay = new CoordinateSystemDisplay(cont, {
        xGraduation: .5,
        yGraduation: .5,
        xUnit: 120,
        yUnit: 130,
        xMin: -2,
        yMin: -3
    });
    let dots = perceptronData.split(';').filter(p => p).map(pair => {
        let arr = pair.split(',');
        return {
            x1: arr[0] * 1,
            x2: arr[1] * 1,
            y: arr[2] * 1 === 1 ? 1 : 0
        };
    });
    let array1 = dots.map(d => d.x1);
    let array2 = dots.map(d => d.x2);
    let standardize1 = getStandardize(array1);
    let standardize2 = getStandardize(array2);
    let _dots = dots.map(d => {
        let _d = {...d};
        _d.x1 = standardize1(_d.x1);
        _d.x2 = standardize2(_d.x2);
        return _d;
    });
    console.log(_dots);
    _dots.forEach(pair => {
        if(pair.y === 1) {
            sysDisplay.drawDot({
                x: pair.x1,
                y: pair.x2
            },'green');
        } else {
            sysDisplay.drawDot({
                x: pair.x1,
                y: pair.x2
            },'red');
        }
    });
    let theta = new Matrix([[10,10,10]]);
    function sigmoid(xMatrix) {
        return 1 / (1 + Math.exp(-theta.multiply(xMatrix.transpose()).data[0]));
    }

    function cal() {
        let _theta = [...theta.data];
        let x0 = 1;
        let arr = _theta.map((t,i)=> {
            let m1 = new Matrix([_dots.map(d => {
                let { x1,x2,y} = d;
                let m = new Matrix([[x0,x1,x2]]);
                let ret = sigmoid(m) - y;
                return ret;
            })]);
            let m2 = new Matrix([_dots.map(d => {
                let {x1,x2} = d;
                return [x0,x1,x2][i]
            })]);
            return t - ETA * m1.multiply(m2.transpose()).data[0];
        });
        theta = new Matrix([arr]);
    }
    for (let i=0;i<8000;i++){
        cal();
    }
    let [theta0,theta1,theta2] = theta.data;
    function f(x) {
        return -(theta0 + theta1 * x) / theta2;
    }
    let start = {x:-2};
    let end = {x:2};
    start.y = f(start.x)
    end.y = f(end.x);
    console.log(start,end);
    sysDisplay.drawLine(start,end,'green');
    console.log(sigmoid(new Matrix([[1,standardize1(210),standardize2(200)]])));
    sysDisplay.refresh();
};
