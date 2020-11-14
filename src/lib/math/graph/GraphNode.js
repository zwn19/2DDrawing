/* eslint-disable */
class Node {
    constructor(value) {
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    equals(node) {
        return node.value === this.value;
    }
}
export default Node;
