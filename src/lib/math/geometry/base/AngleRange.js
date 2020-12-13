/* eslint-disable */
import Range from "./Range";
import {transToProperRadian} from "../../../utils/index"

class AngleRange {
    constructor(start,delta) {
        this.ranges = [];
        start = transToProperRadian(start);
        let end = start + delta;
        if(end < 0) {
            this.ranges.push(new Range(transToProperRadian(end), Math.PI * 2));
            this.ranges.push(new Range(0, start));
        } else if (end > Math.PI * 2) {
            this.ranges.push(new Range(start, Math.PI * 2));
            this.ranges.push(new Range(0, transToProperRadian(end)));
        } else {
            this.ranges.push(new Range(start, transToProperRadian(end)));
        }
    }
    isInRange(num, contains = true) {
        num = transToProperRadian(num);
        for(let range of this.ranges) {
            if (range.isInRange(num, contains)) {
                return true;
            }
        }
        return false;
    }
}
export default AngleRange;
