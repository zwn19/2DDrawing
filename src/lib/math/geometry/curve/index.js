/* eslint-disable */

function calculateCrossPoints(curve1,curve2) {
    let lines1 , lines2;
    if (curve1.generateLineSegments) {
        lines1 = curve1.generateLineSegments(72);
    } else if (curve1.getLines) {
        lines1 = curve1.getLines();
    } else {
        lines1 = [curve1];
    }
    if (curve2.generateLineSegments) {
        lines2 = curve2.generateLineSegments(72);
    } else if (curve2.getLines) {
        lines1 = curve2.getLines();
    } else {
        lines2 = [curve2];
    }
    let points = [];
    lines1.forEach(l1 => {
        lines2.forEach(l2 => {
            let p = l1.getCrossPoint(l2);
            if (p) {
                points.push(p);
            }
        });
    });
    return points;
}

function distanceBetweenPointLine(point,line) {
    let normal = line.getNormalLine(point);
    let cross = normal.getLineCrossPoint(line);
    return cross.distanceTo(point);
}

export {
    calculateCrossPoints,
    distanceBetweenPointLine
}
