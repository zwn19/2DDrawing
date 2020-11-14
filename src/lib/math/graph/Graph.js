/* eslint-disable */
import Node from "./GraphNode";
import Path from "./GraphPath";
import Edge from "./GraphEdge";
import UniqueArray from "../../utils/UniqueArray";
class Graph{
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    _getEdgesStartWith(node) {
        return this.edges.filter(edg => edg.start === node);
    }
    _getEdgesStartWithValue(value) {
        return this.edges.filter(edg => edg.start.getValue() === value);
    }
    _getNodeByValue(value) {
        return this.nodes.find(n => n.getValue() === value)
    }
    addNodeIfNotExist(value) {
        let node = this._getNodeByValue(value);
        if (!node) {
            let _node = new Node(value);
            this.nodes.push(_node);
            return _node;
        }
        return node;
    }
    addEdge(start,end,weight = 1) {
        let startNode = this.addNodeIfNotExist(start);
        let endNode = this.addNodeIfNotExist(end);
        let edge = new Edge(startNode, endNode, weight);
        this.edges.push(edge);
    }

    fetchPathsTo(path,endValue) {
        if (path.isEndWithNodeValue(endValue)) {
            return [path];
        }
        let curNode = path.getLastNode();
        let edges = this._getEdgesStartWith(curNode);
        if (!edges || !edges.length) {
            return [];
        }
        let allPath = [];
        for(let i = 0;i < edges.length;i++) {
            let edg = edges[i];
            let _path = path.copy();
            if (edg.isEndWithNodeValue(endValue)) {
                _path.appendEdge(edg);
                allPath.push(_path);
                continue;
            }
            if (path.containsNode(edg.end)) {
                continue;
            }
            if (path.isEndWithNodeValue(edg.start.getValue())) {
                _path.appendEdge(edg);
                let subPaths = this.fetchPathsTo(_path, endValue);
                allPath = allPath.concat(subPaths);
            }
        }
        return allPath;
    }

    getAllPath(start,end) {
        let edges = this._getEdgesStartWithValue(start)
        let allPath = [];
        edges.forEach(edg => {
            let path = new Path(edg);
            let paths = this.fetchPathsTo(path,end);
            if (paths && paths.length) {
                allPath = allPath.concat(paths)
            }
        });
        return allPath;
    }

    getCycle(value) {
        let paths = this.getAllPath(value,value);
        return paths.filter(p => p.count() > 2);
    }

    getCycles() {
        let values = this.nodes.map(n => n.value);
        let allPath = [];
        values.forEach(value => {
            let paths = this.getCycle(value);
            allPath = allPath.concat(paths);
        });
        return allPath;
    }

    hasCycles() {
        return !!this.getCycles().length;
    }

    findEdgeByStartEnd(start,end) {
        let edgs = this._getEdgesStartWithValue(start)
        return edgs.find(edg =>edg.end.getValue() === end)
    }

    getLongestLevelPath(startValue,endValue) {
        let paths = this.getAllPath(startValue,endValue);
        return paths.reduce((tar, cur) => {
            if (cur.count() > tar.count()) {
                return cur;
            }
            return tar;
        },new Path());
    }

    getShortestLevelPath(startValue,endValue) {
        // 广度优先
        let find = (curNodeValue) => {
            let edgs = this._getEdgesStartWithValue(curNodeValue)
            if (edgs) {
                let toEndEdge = edgs.find(edg => edg.end.getValue() === endValue)
                if (toEndEdge) {
                    return [toEndEdge];
                }
                for(let i = 0;i < edgs.length;i++) {
                    let next = edgs[i].end.getValue();
                    let toEndEdges = find(next);
                    if (toEndEdges) {
                        return [edgs[i],...toEndEdges]
                    }
                }
            }
        }
        let edges = find(startValue);
        let path = new Path();
        edges.forEach(edg => {
            path.appendEdge(edg)
        });
        return path;
    }
    getShortestPath(startValue,endValue) {
        // 迪克斯斯特拉,只适用于 有向无环图
        let counter = new Map();
        let currentNode = startValue;
        let currentPath = new Path();
        let calculatedNodes = [endValue];
        let calculate = () => {
            calculatedNodes.push(currentNode);
            let edges = this._getEdgesStartWithValue(currentNode)
            if (edges) {
                edges.forEach(edg => {
                    let _path = currentPath.copy();
                    _path.appendEdge(edg);
                    let value = edg.end.getValue();
                    if(!counter.has(value)) {
                        counter.set(value,{
                            path: _path,
                            value: _path.getTotalWeight()
                        })
                    } else {
                        let oldPair = counter.get(value);
                        if ( _path.getTotalWeight() < oldPair.value) {
                            counter.set(value,{
                                path: _path,
                                value: _path.getTotalWeight()
                            });
                        }
                    }
                });
            }
            let minWeight = Number.MAX_VALUE,nextNodeValue;
            counter.forEach((pair,value) => {
                if(calculatedNodes.indexOf(value) > -1) {
                    return ;
                }
                if(minWeight > pair.value) {
                    minWeight = pair.value;
                    currentPath = pair.path;
                    nextNodeValue = value;
                }
            });
            if (nextNodeValue) {
                currentNode = nextNodeValue;
                calculate();
            }
        }
        calculate();
        return counter.get(endValue).path;
    }

    getLevelsNodes() {
        let firstNodes = new UniqueArray(this.edges.map(edg => edg.start));
        let endNodes = new UniqueArray(this.edges.map(edg => edg.end));
        let nodes = firstNodes.filter(n => !endNodes.find(_n => _n === n))
        if (nodes.length === 0) {
            throw new Error("没有确定的根节点");
        }
        let counter = {
            0: nodes
        };
        nodes.forEach(node => {
            this.nodes.forEach(n => {
                if (n !== node) {
                    let paths= this.getAllPath(node.getValue(), n.getValue());
                    let depth = paths.map(p => p.count()).join(",");
                    counter[depth] = counter[depth] || [];
                    counter[depth].push(n);
                }
            });
        });
        return counter;
    }
}

export default Graph;
