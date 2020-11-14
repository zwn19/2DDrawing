/* eslint-disable */
import UniqueArray from "./UniqueArray";

function _combination(list, subList, subSetCount) {
    let ret = [];
    let count = subSetCount - 1;
    list.forEach((item,i) => {
        let sub = [...subList,item]
        if (count === 0) {
            ret.push(sub);
        } else {
            let left = [...list];
            left.splice(0,i + 1);
            let _sub = _combination(left,sub,count);
            ret = ret.concat(_sub)
        }
    });
    return ret;
}
function _permutation(list,subList,subSetCount) {
    let ret = [];
    let count = subSetCount - 1;
    list.forEach((item,i) => {
        let sub = [...subList,item]
        if (count === 0) {
            ret.push(sub);
        } else {
            let left = [...list];
            left.splice(i,1);
            let _sub = _permutation(left,sub,count);
            ret = ret.concat(_sub)
        }
    });
    return ret;
}

function permutation(list,count) {
    let indices = list.map((item,i) => i);
    let subIndices = _permutation(indices, [], count);
    return subIndices.map(indexArr => {
        return indexArr.map(index => list[index])
    });
}
function combination(list,count) {
    let indices = list.map((item,i) => i);
    let subIndices = _combination(indices, [], count);
    return subIndices.map(indexArr => {
        return indexArr.map(index => list[index])
    });
}

function arrayIntersection (arr1,arr2,equals = isEqual) {
    let arr = new UniqueArray([],equals)
    arr1.forEach(i => {
        if (arr2.find(j => equals(i,j))) {
            return;
        }
        arr.push(i)
    });
    return arr.toArray();
}

function arrayUnion(arr1,arr2,equals = isEqual) {
    let arr = new UniqueArray([],equals)
    arr1.forEach(i => {
        arr.push(i);
    });
    arr2.forEach(i => {
        arr.push(i);
    });
    return arr.toArray()
}

function isEqual(item1,item2) {
    if (item1 === item2) {
        return true;
    }
    if(item1.equals) {
        return item1.equals(item2);
    }

    if(item2.equals) {
        return item2.equals(item1);
    }
}

function range(start,end) {
    let current = start;
    return {
        [Symbol.iterator](){
            return this;
        },
        next() {
            if(current < end) {
                return {
                    value: current++,
                    done: false
                }
            }
            return {
                done: true
            }
        }
    }
}

export {
    combination,
    permutation,
    arrayUnion,
    arrayIntersection,
    isEqual,
    range
}
