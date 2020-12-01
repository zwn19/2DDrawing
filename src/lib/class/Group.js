/* eslint-disable */
import Element from "./Element";
import { getSVGElement } from "./Common";
class Group extends Element{
    constructor(attrs, style) {
        super(attrs, style);
        this.children = [];
        this.tagName = "g";
    }
    isGroup() {
        return true;
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
}
export default Group;
