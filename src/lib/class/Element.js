/* eslint-disable */
import Matrix from "../../lib/math/Matrix";
import { STYLE_PROPS } from "../utils/Constant";
import RectArea from "../math/geometry/base/RectArea";

class Element {
    removeNoneAttr(obj) {
        for(let p in obj) {
            if (obj[p] === null || obj[p] === undefined) {
                delete obj[p];
            }
        }
    }
    constructor(attrs = {}, style = {}) {
        this.props = {};
        this.style = {
            stroke: "none",
            strokeWidth: 1,
            strokeOpacity: 1,
            fill: "#000",
            fillOpacity: 1,
            transformOrigin: "left top"
        };
        for (let p in attrs) {
            if(STYLE_PROPS.indexOf(p) > -1) {
                this.setStyle(p, attrs[p]);
            }
            else if(p !== "style") {
                this.setProps(p, attrs[p]);
            }
        }
        this.removeNoneAttr(style);
        for (let p in style) {
            this.setStyle(p, style[p]);
        }
        // 默认变换中心为左上
        this.props._id = this.props._id || `${(new Date()).getTime()+ Math.random()}`+ Math.random();
        this.tagName = "";
    }
    getPoints() {

    }
    getBoundaries() {

    }
    getContainingRect() {
        let points = this.getPoints();
        let ret = {
            max: {
                x: Number.MIN_SAFE_INTEGER,
                y: Number.MIN_SAFE_INTEGER
            },
            min: {
                x: Number.MAX_SAFE_INTEGER,
                y: Number.MAX_SAFE_INTEGER
            }
        }
        points.forEach(({x,y}) => {
            ret.max.x = Math.max(x, ret.max.x);
            ret.max.y = Math.max(y, ret.max.y);
            ret.min.x = Math.min(x, ret.min.x);
            ret.min.y = Math.min(y, ret.min.y);
        });
        return new RectArea(ret.min, {
            width: ret.max.x - ret.min.x,
            height: ret.max.y - ret.min.y
        });
    }
    isText() {
        return false;
    }
    isGroup() {
        return false;
    }
    reverseCamelCaseName(name) {
        return name.replace(/([A-Z])([^A-Z]*)/g,(g,g1,g2) => {
            return `-${g1.toLowerCase()}${g2}`;
        });
    }
    camelCaseName(name) {
        return name.replace(/-([^-])([^-]*)/g,(m,g1,g2) => {
            return g1.toUpperCase() + g2;
        });
    }
    updateMatrix(matrix) {
        this.style.transform = matrix.toCSSString();
    }
    getStyle(name) {
        return this.style[this.camelCaseName(name)];
    }
    getComputedStyle(key) {
        let val = this.getStyle(key)
        if (val) {
            return val;
        } else if(this.parentNode){
            return this.parentNode.getComputedStyle(key);
        }
    }
    getProps(name) {
        return this.props[this.camelCaseName(name)];
    }
    setProps(name,value) {
        this.props[this.camelCaseName(name)] = value;
    }
    setStyle(name,value) {
        this.style[this.camelCaseName(name)] = value;
    }
    getCurrentMatrix() {
        if (this.style.transform) {
            return Matrix.fromCSSTransform(this.style.transform);
        }
        return Matrix.init(3);
    }
    getMatrix() {
        const m = this.getCurrentMatrix();
        if (this.parentNode) {
            return this.parentNode.getMatrix().multiply(m);
        }
        return m;
    }
    copy() {
        delete this.props._id;
        return new this.constructor(this.props,this.style);
    }
    innerSVGString() {
        if (this.children && this.children.length) {
            const cnt = [];
            this.children.forEach((c) => {
                cnt.push(c.toSVGString());
            });
            return cnt.join("");
        } else if (this.content){
            return this.content;
        }
        return "";
    }
    toSVGString() {
        const attrs = [],
            styles = [];
        for (const p in this.props) {
            if (STYLE_PROPS.indexOf(p) === -1 && p !== "style") {
                attrs.push(`${this.reverseCamelCaseName(p)}='${this.props[p].toString().replace(/&quot;/g, "").replace(/'/g, "")}'`);
            }
        }
        for (const p in this.style) {
            if (this.style[p] !== null && this.style[p] !== undefined) {
                if (p === "transform") {
                    attrs.push(`${this.reverseCamelCaseName(p)}='${this.getCurrentMatrix().toCSSString()}'`);
                } else {
                    styles.push(`${this.reverseCamelCaseName(p)}:${this.style[p].toString().replace(/&quot;/g, "")}`);
                }
            }
        }
        const endTag = `</${this.tagName}>`;
        const styleStr = `style="${styles.join(";")}"`;
        const attrStr = attrs.join(" ");
        return `<${this.tagName} ${attrStr} ${styleStr}>${this.innerSVGString()}${endTag}`;
    }
    toCanvas(context) {
        console.log(this.tagName);
    }
}

export default Element;


