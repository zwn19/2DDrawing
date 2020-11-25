import Point from "./geometry/point";
import Vector from "./geometry/Vector";

const TOLERANCE = 0.001;
function roundRadian(r) {
    let angle = toDegree(r);
    return toRadian(roundAngle(angle));
}

function roundAngle(angle) {
    if (Math.abs(360 - angle) < TOLERANCE) {
        return 360;
    }
    if(angle < 0) {
        return angle % 360 + 360;
    }
    return angle % 360;
}

function toRadian(a) {
    return a * Math.PI / 180;
}

function toDegree(r) {
    return r / Math.PI * 180;
}

function uniqueArray(array) {
    let s = new Set(array);
    return Array.from(s);
}

function degreeEquals(ang1,ang2) {
    ang1 = roundAngle(ang1);
    ang2 = roundAngle(ang2);
    return Math.abs(ang1 - ang2) < TOLERANCE;
}

function radianEquals(rad1,rad2) {
    return degreeEquals(toDegree(rad1),toDegree(rad2));
}

function distance(p1,p2) {
    const deltaX = p1.x - p2.x;
    const deltaY = p1.y - p2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
function getPointsCenter(points) {
    const _sum = [{ x: 0, y: 0 }, ...points].reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }));
    return new Point(_sum.x / points.length, _sum.y / points.length);
}
// 判断两个点的方向
function isPositivePolarAngle(p1,p2,pivot) {
    if (!pivot) {
        pivot = getPointsCenter([p1,p2]);
    }
    let vec1 = Vector.fromTwoPoints(pivot,p1);
    let vec2 = Vector.fromTwoPoints(pivot,p2);
    if (vec1.getCrossAngle(vec2) < 0) {
        return false;
    }
    return true;
}

function sortPoints(points,center) {
    if (!center) {
        center = getPointsCenter(points);
    }
    let _points = [...points];
    _points.sort((_p1,_p2) => {
        if (isPositivePolarAngle(_p1,_p2, center)){
            return -1;
        }
        return 1;
    })
    return _points;
}

function resolveQuadraticEquation(a,b,c) {
    let delta = b * b - 4 * a * c;
    if (delta < 0) {
        throw new Error("方程无解");
    }
    let x1 = (-b + Math.sqrt(delta)) / (2 * a);
    let x2 = (-b - Math.sqrt(delta)) / (2 * a);
    return [x1,x2];
}

export {
    roundRadian,
    roundAngle,
    toDegree,
    toRadian,
    uniqueArray,
    radianEquals,
    degreeEquals,
    distance,
    getPointsCenter,
    sortPoints,
    isPositivePolarAngle,
    resolveQuadraticEquation
}
