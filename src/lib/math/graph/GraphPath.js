/* eslint-disable */
import UniqueArray from "../../utils/UniqueArray";

class Path {
    constructor(start) {
        this.edges =[];
        if (start) {
            this.edges.push(start);
        }
    }
    isReverse(path) {
        let edgs = [...this.edges];
        let _edgs = [...path.edges];
        if(edgs.length !== _edgs.length) {
            return false;
        }
        _edgs.reverse();
        for(let i = 0;i < edgs.length;i++) {
            if (!edgs[i].isReverse(_edgs[i])) {
                return false;
            }
        }
        return true;
    }
    count() {
        return this.edges.length;
    }
    copy() {
        let p = new Path();
        p.edges = [...this.edges];
        return p;
    }
    containsNode(node) {
        let nodes = this.getNodes();
        return !!nodes.find(n => n.equals(node));
    }
    appendEdge(edge) {
        let last = this.edges[this.edges.length - 1];
        if (!last) {
            this.edges.push(edge);
            return true;
        }
        if (last.end === edge.start) {
            this.edges.push(edge);
            return true;
        }
        return false;
    }
    getStartNode() {
        let start = this.edges[0];
        if (start) {
            return start.start;
        }
    }
    getLastNode() {
        let last = this.edges[this.edges.length - 1];
        if (last) {
            return last.end;
        }
    }
    getNodes() {
        let nodes = new UniqueArray();
        this.edges.forEach(edg => {
            nodes.push(...edg.getNodes());
        });
        return nodes;
    }
    isEndWithNodeValue(value) {
        return this.getLastNode().getValue() === value;
    }
    isStartWithNodeValue(value) {
        return this.getStartNode().getValue() === value;
    }
    toString() {
        let edgs = this.edges;
        let pathNames = edgs.map(edg => edg.end.value.toString());
        pathNames.unshift(this.getStartNode().value.toString());
        return pathNames.join("->") + ";权重:" + this.getTotalWeight();
    }
    getTotalWeight() {
        return this.edges.reduce((sum,edg) => {
            sum += edg.weight;
            return sum;
        },0);
    }
    pop() {
        return this.edges.pop();
    }
}
export default Path;
