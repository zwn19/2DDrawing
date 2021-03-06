/* eslint-disable */
import Element from "./Element";
import { getSVGElement } from "./Common";
import Point from "../math/geometry/base/Point";
import UniqueArray from "../utils/UniqueArray";
import {getPointsCenter} from "../math/utils";
class Group extends Element{
    constructor(attrs, style) {
        super(attrs, style);
        this.children = [];
        this.tagName = "g";
    }
    contains(ele) {
        if (this.children.indexOf(ele) > -1){
            return true;
        }
        for(let sub of this.children){
            if (sub.contains && sub.contains(ele)) {
                return true;
            }
        }
        return false;
    }
    isInArea({x,y}) {
        let p = new Point(x,y);
        return !!this.children.find(c => {
            if(c.isInArea(p)) {
                return  true;
            }
        })
    }
    isGroup() {
        return true;
    }
    getPoints() {
        let points = new UniqueArray();
        this.children.forEach(c => {
            points = points.concat(c.getPoints());
        });
        return points;
    }
    getCenter() {
        let points = this.getPoints();
        return getPointsCenter(points);
    }
    getBoundaries() {
        let lines = new UniqueArray();
        this.children.forEach(c => {
            lines = lines.concat(c.getBoundaries());
        });
        return lines;
    }
    removeChild(c) {
        const i = this.children.indexOf(c);
        if (i > -1) {
            c.parentNode = null;
            this.children.splice(i, 1);
        } else {
            this.children.forEach((_c) => {
                if (_c.isGroup()) {
                    _c.removeChild(c);
                }
            });
        }
    }

    setChildren(children) {
        this.children.forEach((i) => {
            i.parentNode = null;
        });
        this.children = [];
        this.addChildren(children);
    }

    prependChild(c) {
        this.children.unshift(c);
        c.parentNode = this;
    }

    addChildFromText(text) {
        const ele = getSVGElement(text);
        this.addChild(ele);
    }

    addChild(c) {
        this.children.push(c);
        c.parentNode = this;
    }

    addChildren(list) {
        list.forEach((c) => {
            this.addChild(c);
        });
    }

    toCanvas(context) {
        context.save();
        let m = this.getCurrentMatrix();
        context.transform.apply(context, m.toCSSMatrixArray());
        this.children.forEach(c => {
            c.toCanvas(context);
        });
        context.restore();
    }
    eachChild(fn) {
        this.children.forEach(c => {
          fn(c);
          if(c.isGroup()) {
              c.eachChild(fn);
          }
        })
    }

    getChildren(fn) {
        let ret = []
        this.children.forEach(c => {
            if(fn(c)) {
                ret.push(c)
            }
            if(c.isGroup()) {
                let sub = c.getChildren(fn);
                ret = ret.concat(sub);
            }
        })
    }
    getFirstChild(fn) {
        for(let c of this.children) {
            if(fn(c)) {
                return c;
            }
            if(c.isGroup()) {
                let sub = c.getFirstChild(fn);
                if (sub) {
                    return sub;
                }
            }
        }
    }
}
export default Group;
