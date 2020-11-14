/* eslint-disable */
import Text from "./Text";
class Tspan extends Text{
    constructor(attrs, style, content) {
        super(attrs, style, content);
        this.tagName = "tspan";
    }
}
export default Tspan;
