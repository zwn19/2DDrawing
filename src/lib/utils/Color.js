/* eslint-disable */
import {
    COLOR_MAP
} from "../utils/Constant";


class Color {
    constructor(r,g,b,a = 1) {
        if (a === undefined) {
            this.isTransparent = true;
        } else {
            this.r = parseInt(r);
            this.g = parseInt(g);
            this.b = parseInt(b);
            this.a = parseInt(a);
        }
    }
    _toHex(number) {
        let num = number.toString(16);
        if (num.length === 1) {
            return `0${num}`;
        }
        return num;
    }
    toString() {
        if (this.isTransparent) {
            return "transparent";
        }
        if (this.a === 1) {
            return `#${this._toHex(this.r)}${this._toHex(this.g)}${this._toHex(this.b)}`;
        } else {
            return `rgba(${this.r},${this.g},${this.b},${this.a})`;
        }
    }
    setAlpha(a) {
        this.a = a;
    }
    copy() {
        let { r,g,b,a} = this;
        return new Color(r,g,b,a);
    }
}
Color.transparent = function () {
    return new Color();
}
Color.composeColorOpacity = function(colorString, opacity) {
    let color = Color.create(colorString);
    color.setAlpha(opacity);
    return color.toString();
}
Color.create = function (str) {
    if (str.toLowerCase() === "transparent") {
        return Color.transparent();
    }
    if(COLOR_MAP[str.toLowerCase()]) {
        str = COLOR_MAP[str.toLowerCase()];
    }
    // #
    let reg = /^#([0-9a-f]{3})$|^#([0-9a-f]{6})$/i;
    let ret = reg.exec(str);
    if (ret) {
        if (ret[1]) {
            let arr = ret[1].split("");
            let r = parseInt(arr[0] + arr[0],16);
            let g = parseInt(arr[1] + arr[1],16);
            let b = parseInt(arr[2] + arr[2],16);
            return new Color(r,g,b);
        }
        if (ret[2]) {
            let _reg = /[0-9a-f]{2}/ig;
            let [r,g,b] = ret[2].match(_reg).map(m => {
                return parseInt(m,16);
            });
            return new Color(r,g,b);
        }
    }
    //rgba,rgb
    reg = /^rgb\([0-9a-f\s]+,[0-9a-f\s]+,[0-9a-f\s]+\)$|^rgba\([0-9a-f\s]+,[0-9a-f\s]+,[0-9a-f\s]+,[\d\.\s]+\)$/i;
    if (reg.test(str)) {
        let [r,g,b,a] = str.match(/[^rgba,()\s]+/ig);
        return new Color(r,g,b,a);
    }
    throw new Error(`格式不支持 ${str}`);
}
export default Color;


function fn(s) {
    let reg = /([a-z]+)\s(#[a-f0-9]{6})/gi;
    let ret = reg.exec(s);
    let obj = {};
    while (ret) {
        obj[ret[1]] = ret[2];
        ret = reg.exec(s);
    }
    return obj;
}
