/* eslint-disable */
import Group from "./Group";
import Point from "../math/geometry/Point";
import Color from "../utils/Color";

class Text extends Group{
    constructor(attrs, style, content) {
        super(attrs, style);
        this.tagName = "text";
        this.content = content;
        let { x, y } = this.props;
        this.start = new Point(x,y);
    }
    isText() {
        return true;
    }
    getPosition() {
        const m = this.getMatrix();
        return m.applyToPoint(this.start);
    }
    updateContent(content) {
        if (this.children.length) {
            this.children.forEach((txt) => {
                txt.content = content;
            });
        } else {
            this.content = content;
        }
    }
    toCanvas(context) {
        if(this.children.length) {
            this.children.forEach(t => {
                t.toCanvas(context);
            });
            return;
        }
        context.save();
        let m = this.getCurrentMatrix();
        let fill = this.getStyle("fill");
        let stroke = this.getStyle("stroke");
        let strokeWidth = this.getStyle("stroke-width");
        let miterLimit = this.getProps("stroke-miterlimit");
        let opacity = this.getComputedStyle("opacity");
        let fontSize = this.getComputedStyle("font-size") || 14;
        let family = this.getComputedStyle("font-family") || "Arial";
        let anchor = this.getProps("text-anchor");
        let mode = this.getProps("writing-mode")
        if (stroke && stroke !== "none") {
            let opacity = this.getStyle("stroke-opacity") || 1;
            context.strokeStyle = Color.composeColorOpacity(stroke,opacity);
            context.lineWidth = strokeWidth;
        }
        if (fill && fill !== "none" && fill !== "transparent") {
            let opacity = this.getStyle("fill-opacity") || 1;
            context.fillStyle = Color.composeColorOpacity(fill,opacity);;
        }
        if (miterLimit) {
            context.miterLimit = miterLimit;
        }
        if (opacity) {
            context.globalAlpha = opacity;
        }
        if (anchor) {
            if (anchor === "middle") {
                context.textAlign = "center";
            } else {
                context.textAlign = anchor;
            }
        }
        context.transform.apply(context, m.toCSSMatrixArray());
        let font = [];
        if (fontSize) {
            font.push(`${Math.round(fontSize * 1)}px`)
        }
        if (family) {
            font.push(family)
        }
        if (font.length) {
            context.font = font.join(" ")
        }
        if (mode === "tb") {
            const letters = this.content.split("");
            letters.forEach((letter, i) => {
                const { width } = context.execute("measureText", letter);
                const deltaPosition = {
                    w: -width / 2,
                    h: width / 2,
                };
                // 认为文字高宽比是16:9
                context.fillText(letter, (this.start.x || 0) + deltaPosition.w, (this.start.y || 0) + width * i * 16 / 9 + deltaPosition.h);
            });
        } else {
            context.fillText(this.content, this.start.x || 0, this.start.y || 0)
        }
        context.restore();
    }
}
export default Text;
