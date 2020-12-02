/* eslint-disable */
class Range {
    constructor(min,max) {
        this.min = Math.min(min,max);
        this.max = Math.max(min,max);
    }
    isInRange(num, contains = true) {
        if (num > this.min && num < this.max) {
            return true;
        }
        if (contains) {
            let { min, max } = this;
            if (Math.abs(num - min) < 0.00001) {
                return true;
            }
            if (Math.abs(num - max) < 0.00001) {
                return true;
            }
        }
        return false;
    }
}
export default Range;
