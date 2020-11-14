/* eslint-disable */
class Edge {
    constructor(start,end,weight = 1,name = "") {
        this.start = start;
        this.end = end;
        this.weight = weight;
        this.name = name;
    }
    isReverse(edge) {
        return this.start.equals(edge.end) && this.end.equals(edge.start)
    }
    equals(edge) {
        return this.start === edge.start && this.end === edge.end && this.name === edge.name && this.weight === this.weight;
    }
    isEndWithNodeValue(val) {
        return this.end.getValue() === val;
    }
    isStartWithNodeValue(val) {
        return this.start.getValue() === val;
    }
    getNodes() {
        return [this.start,this.end];
    }
}
export default Edge;
