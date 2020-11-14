/* eslint-disable */
// 无向图
import Graph from "./Graph";

class Undigraph extends Graph{
    constructor() {
        super();
    }
    addEdge(name1,name2,weight) {
        super.addEdge(name1,name2,weight);
        super.addEdge(name2,name1,weight);
    }
    getCycle(name) {
        let paths = super.getCycle(name);
        let _arr = [];
        paths.forEach((p) => {
            if(!_arr.find(_p => _p.isReverse(p))){
                _arr.push(p)
            }
        });
        return _arr;
    }

    getShortestPath(startName,endName) {
        let paths = this.getAllPath(startName,endName);
        return paths.reduce((target,cur) => {
            if (target.getTotalWeight() < cur.getTotalWeight()) {
                return  target;
            }
            return cur;
        })
    }
}


export default Undigraph;
