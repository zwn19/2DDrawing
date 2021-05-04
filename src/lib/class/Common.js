/* eslint-disable */

import Group from "./Group";
import Point from "../math/geometry/base/Point";
import Polyline from "./Polyline";
import Polygon from "./Polygon";
import Ellipse from "./Ellipse";
import Rectangle from "./Rectangle";
import Path from "./Path";
import Text from "./Text";
import Tspan from "./Tspan";
import Circle from "./Circle";
import SVGImage from "./Image";
import Line from "./Line";
import Root from "./Root";
import { STYLE_PROPS } from "../utils/Constant";
import Matrix from "../math/Matrix";

function fetchAttrs(attrs, origin) {
    const ret = {};
    attrs.forEach((attr) => {
        ret[attr] = origin[attr];
    });
    return ret;
}
function resolvePolyline(svgPolyline) {
    const points = [];
    let ps = svgPolyline.attrs.points.split(/[,\s]/);
    ps = ps.filter(p => p);
    ps.forEach((p, index) => {
        if (p && !(index % 2)) {
            points.push(new Point(ps[index], ps[index + 1]));
        }
    });
    const style = fetchAttrs([...STYLE_PROPS], svgPolyline.attrs);
    Object.assign(style, svgPolyline.attrs.style);
    const polygon = new Polyline(svgPolyline.attrs, style, points);
    return polygon;
}
function resolvePolygon(svgPolygon) {
    const points = [];
    let ps = svgPolygon.attrs.points.split(/[,\s]/);
    ps = ps.filter(p => p);
    ps.forEach((p, index) => {
        if (p && !(index % 2)) {
            points.push(new Point(ps[index], ps[index + 1]));
        }
    });
    if (!points[0].equals(points[points.length - 1])) {
        points.push(points[0]);
    }
    const style = fetchAttrs([...STYLE_PROPS], svgPolygon.attrs);
    Object.assign(style, svgPolygon.attrs.style);
    const polygon = new Polygon(svgPolygon.attrs, style, points);
    return polygon;
}
function resolveEllipse(svgEllipse) {
    const style = fetchAttrs([...STYLE_PROPS], svgEllipse.attrs);
    Object.assign(style, svgEllipse.attrs.style);
    const ellipse = new Ellipse(svgEllipse.attrs, style);
    return ellipse;
}
function resolveRect(svgRect) {
    const style = fetchAttrs([...STYLE_PROPS], svgRect.attrs);
    Object.assign(style, svgRect.attrs.style);
    const rect = new Rectangle(svgRect.attrs, style);
    return rect;
}
function resolvePath(svgPath) {
    const style = fetchAttrs([...STYLE_PROPS], svgPath.attrs);
    Object.assign(style, svgPath.attrs.style);
    const path = new Path(svgPath.attrs, style);
    return path;
}
function radian(ux, uy, vx, vy) {
    const dot = ux * vx + uy * vy;
    const mod = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
    let rad = Math.acos(dot / mod);
    if (ux * vy - uy * vx < 0.0) {
        rad = -rad;
    }
    return rad;
}

function resolveText(svgText) {
    const style = fetchAttrs([...STYLE_PROPS, "font-family", "font-size"], svgText.attrs);
    Object.assign(style, svgText.attrs.style);
    const text = new Text(svgText.attrs, style, svgText.children.length && svgText.children[0].text);
    return text;
}
function resolveTspan(svgTspan) {
    const style = fetchAttrs([...STYLE_PROPS, "font-family", "font-size"], svgTspan.attrs);
    Object.assign(style, svgTspan.attrs.style);
    const text = new Tspan(svgTspan.attrs, style, svgTspan.children.length && svgTspan.children[0].text);
    return text;
}
function resolveCircle(svg) {
    const style = fetchAttrs([...STYLE_PROPS], svg.attrs);
    Object.assign(style, svg.attrs.style);
    return new Circle(svg.attrs, style);
}

function resolveImage(svgRect) {
    const style = fetchAttrs([...STYLE_PROPS], svgRect.attrs);
    Object.assign(style, svgRect.attrs.style);
    const rect = new SVGImage(svgRect.attrs, style);
    return rect;
}
function resolveLine(svgLine) {
    const style = fetchAttrs([...STYLE_PROPS], svgLine.attrs);
    Object.assign(style, svgLine.attrs.style);
    return new Line(svgLine.attrs, style);
}
function resolveSVG(svgText) {
    return compileSVG(svgText)[0];
    function compileSVG(template) {
        const tagStack = [];
        const all = [];
        const startReg = /<([a-zA-Z]+)([^<>]*?)(\/?)>|([^<>]+)|<\/([a-zA-Z]+)>/g;// 起始tag,属性,纯文本，截止tag
        let ret = startReg.exec(template);
        let obj;
        while (ret) {
            if (ret[1]) {
                obj = {
                    tag: ret[1],
                    start: ret.index + ret[0].length,
                    attrs: resolveAttrs(ret[2]),
                    children: [],
                };
                if (tagStack[tagStack.length - 1]) {
                    tagStack[tagStack.length - 1].children.push(obj);
                } else if(ret[3]) {
                    all.push(obj);
                }
                if (!ret[3]) {
                    tagStack.push(obj);
                }
            } else if (ret[4] && ret[4].replace(/\s/g, "")) {
                tagStack[tagStack.length - 1].children.push({
                    tag: "",
                    text: ret[4],
                });
            } else if (ret[5]) {
                obj = tagStack.pop();
                obj.end = ret.index;
                if (tagStack.length === 0) {
                    all.push(obj);
                }
            }
            ret = startReg.exec(template);
        }
        return all;
    }
    function resolveAttrs(attrString) {
        const reg = /([^<>=\s'"]+)(=(['"])([^"<>=]*)(\3))?/g;
        let ret = reg.exec(attrString);
        const map = {};
        while (ret) {
            if (ret[1] === "style") {
                map.style = resolveStyle(ret[4]);
            }
            else if (ret[1] === "transform") {
                map[ret[1]] = Matrix.fromCSSTransform(ret[4]).toCSSString();
            } else {
                map[ret[1]] = ret[4];
            }
            ret = reg.exec(attrString);
        }
        return map;
    }
    function resolveStyle(styleStr) {
        const style = {};
        const reg = /([^;:]+):([^;:]+)/g;
        styleStr = styleStr.replace(/\s/g, "");
        let ret = reg.exec(styleStr);
        while (ret) {
            style[ret[1]] = ret[2];
            ret = reg.exec(styleStr);
        }
        return style;
    }
}
function resolve(svg) {
    const tag = svg.tag;
    switch (tag) {
        case "svg": {
            const viewBox = svg.attrs.viewBox || svg.attrs.viewbox;
            const sizes = viewBox.split(" ");
            const width = parseInt(sizes[2] || svg.attrs.width, 10);
            const height = parseInt(sizes[3] || svg.attrs.height, 10);
            const root = new Root(Object.assign(svg.attrs, { width, height }), {});
            svg.children.forEach((prop) => {
                const c = resolve(prop);
                if (c) {
                    root.addChild(c);
                }
            });
            return root;
        }
        case "g": {
            const style = fetchAttrs(["transform"], svg.attrs);
            Object.assign(style, svg.attrs.style);
            const g = new Group(svg.attrs, style);
            svg.children.forEach((prop) => {
                const c = resolve(prop);
                if(c.length) {
                    c.forEach(_c => {
                        g.addChild(_c);
                    });
                }
                else if (c) {
                    g.addChild(c);
                }
            });
            return g;
        }
        case "polygon": {
            const polygon = resolvePolygon(svg);
            return polygon;
        }
        case "polyline": {
            const polyline = resolvePolyline(svg);
            return polyline;
        }
        case "rect": {
            const rect = resolveRect(svg);
            return rect;
        }
        case "ellipse": {
            const ellipse = resolveEllipse(svg);
            return ellipse;
        }
        case "line": {
            const line = resolveLine(svg);
            return line;
        }
        case "circle": {
            const circle = resolveCircle(svg);
            return circle;
        }
        case "path": {
            let allD = svg.attrs.d;
            let MZReg = /m[^mz]+(z|$)/ig;
            let groups = allD.match(MZReg);
            if(groups.length < 100000) {
                const path = resolvePath(svg);
                return path;
            }else {
                let ret = [];
                groups.forEach(d => {
                    let obj = JSON.parse(JSON.stringify(svg));
                    obj.attrs.d = d;
                    const path = resolvePath(obj);
                    ret.push(path);
                });
                return ret;
            }
        }
        case "text": {
            const text = resolveText(svg);
            if (svg.children.length && svg.children[0].tag) {
                svg.children.forEach((prop) => {
                    const c = resolve(prop);
                    if (c) {
                        text.addChild(c);
                    }
                });
            }
            return text;
        }
        case "tspan": {
            const tspan = resolveTspan(svg);
            return tspan;
        }
        case "image": {
            const ele = resolveImage(svg);
            return ele;
        }
        default: {
            break;
        }
    }
}
function getSVGElement(txt) {
    return resolve(resolveSVG(txt));
}


export {
    resolveSVG,
    getSVGElement
}

