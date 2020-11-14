/* eslint-disable */
/*
父级变形为M1
本身变形为M2
本身最终变形为M1XM2

canvas transform M1,
再transform M2,
结果为 M1XM2，含义为在M1形成的坐标系为基准再产生形变M2

M1 X M2 X M3 = M1 X (M2 X M3)

坐标系M1中进行相对原始坐标的形变M2 等于 M2 X M1 也等于 M1 X （1/M1 X M2 X M1）

canvas 旋转正方向为: X正向指向Y正向
* */
class Matrix {
    toString() {
        let str = this.data.map(row => {
            return row.join(",")
        }).join("\n");
        return str;
    }

    //二维数组
    constructor(data) {
        if(this._check(data)) {
            this.data = [];
            this.rowCount = data.length;
            this.columnCount = data[0].length;
            data.forEach((row,i) => {
                row.forEach((col,j) => {
                    this.set(i,j,col);
                });
            });
        }
    }
    to2DArray() {
        let arr = [];
        for(let i = 0;i < this.rowCount;i++) {
            arr.push(this.getRow(i));
        }
        return arr;
    }
    getRow(rowNumber) {
        if(rowNumber >= this.rowCount) {
            throw new Error("行数超界限");
        }
        let index = rowNumber * this.columnCount;
        return this.data.slice(index, index + this.columnCount);
    }
    getColumn(columnNumber) {
        if(columnNumber >= this.columnCount) {
            throw new Error("列数超界限");
        }
        let arr = [];
        for(let i = 0;i < this.rowCount;i++) {
            arr.push(this.get(i,columnNumber));
        }
        return arr;
    }
    get(rowNumber,columnNumber) {
        let index = rowNumber * this.columnCount + columnNumber;
        return this.data[index];
    }
    set(rowNumber,columnNumber,val) {
        let index = rowNumber * this.columnCount + columnNumber;
        this.data[index] = val;
    }
    copy() {
        return new Matrix(this.to2DArray());
    }
    _check(data) {
        try{
            let len = data[0].length;
            let notMatchRow = data.find(row => row.length !== len);
            return !notMatchRow;
        }catch(e) {
            return false;
        }
    }

    // 是否列数等于行数
    isSquare(){
        return this.rowCount === this.columnCount;
    }
    // 行列式
    determinant() {
        if (!this.isSquare()) {
            throw new Error("不是方形矩阵");
        }
        if (this.columnCount === 2) {
            return this.get(0,0) * this.get(1,1) - this.get(1,0) * this.get(0,1);
        }
        let row = 0;
        let sum = 0;
        for(let i = 0;i < this.columnCount;i++) {
            sum += this.get(row,i) * this.getCofactor(row, i).determinant() * Math.pow(-1, i + row);
        }
        return sum;
    }
    // 余子式
    getCofactor(row,column) {
        let arr = [];
        for (let i = 0;i < this.rowCount;i++) {
            if(i === row) {
                continue;
            }
            let _arr = [];
            for(let j = 0;j < this.columnCount;j++) {
                if(j === column) {
                    continue;
                }
                _arr.push(this.get(i,j));
            }
            arr.push(_arr);
        }
        return new Matrix(arr);
    }

    // 逆矩阵
    getInverse() {
        if (!this.isSquare()) {
            throw new Error("不是方形矩阵");
        }
        if (this.rowCount === 2) {
            let det = this.determinant();
            let arr = [
                [this.get(1,1),-this.get(0,1)],
                [-this.get(1,0),this.get(0,0)]]
            let m = new Matrix(arr);
            return m.multiplyNumber(1 / det);
        }
        if (this.rowCount === 3) {
            const me = this.data;
            let detInv = 1/ this.determinant();
            let te = [],
            n11 = me[0],
            n21 = me[1],
            n31 = me[2],
            n12 = me[3],
            n22 = me[4],
            n32 = me[5],
            n13 = me[6],
            n23 = me[7],
            n33 = me[8],
            t11 = n33 * n22 - n32 * n23,
            t12 = n32 * n13 - n33 * n12,
            t13 = n23 * n12 - n22 * n13;
            te[0] = t11 * detInv;
            te[1] = (n31 * n23 - n33 * n21) * detInv;
            te[2] = (n32 * n21 - n31 * n22) * detInv;
            te[3] = t12 * detInv;
            te[4] = (n33 * n11 - n31 * n13) * detInv;
            te[5] = (n31 * n12 - n32 * n11) * detInv;
            te[6] = t13 * detInv;
            te[7] = (n21 * n13 - n23 * n11) * detInv;
            te[8] = (n22 * n11 - n21 * n12) * detInv;
            return Matrix.fromArrayRowColumn(te,3,3);
        }
        if (this.rowCount === 4) {
            const me = this.data;
            let detInv = 1/ this.determinant();
            let te = [],
            n11 = me[0],
            n21 = me[1],
            n31 = me[2],
            n41 = me[3],
            n12 = me[4],
            n22 = me[5],
            n32 = me[6],
            n42 = me[7],
            n13 = me[8],
            n23 = me[9],
            n33 = me[10],
            n43 = me[11],
            n14 = me[12],
            n24 = me[13],
            n34 = me[14],
            n44 = me[15],
            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            te[0] = t11 * detInv;
            te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
            te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
            te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
            te[4] = t12 * detInv;
            te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
            te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
            te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
            te[8] = t13 * detInv;
            te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
            te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
            te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
            te[12] = t14 * detInv;
            te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
            te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
            te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
            return Matrix.fromArrayRowColumn(te,4,4);
        }

        let m = Matrix.unitMatrix(this.rowCount);
        let array2D = this.to2DArray();
        let _array2D = m.to2DArray();
        let arr = [];
        array2D.forEach((row,i) => {
            arr.push(row.concat(_array2D[i]))
        });
        let _matrix = new Matrix(arr);
        _matrix = _matrix.simplify();
        arr = [];
        array2D = _matrix.to2DArray();
        array2D.forEach(row => {
            arr.push(row.slice(this.rowCount))
        });
        return new Matrix(arr);
    }
    minusMatrix(matrix) {
        let _matrix = matrix.multiplyNumber(-1);
        return this.plusMatrix(_matrix);
    }
    plusMatrix(matrix) {
        if (this.rowCount !== matrix.rowCount) {
            throw new Error("行数不一致");
        }
        if (this.columnCount !== matrix.columnCount) {
            throw new Error("列数不一致");
        }
        let row = this.rowCount;
        let column = this.columnCount;
        let arr = [];
        for (let i = 0;i < row;i++) {
            let _arr = [];
            for (let j = 0;j < column;j++) {
                _arr.push(this.get(i,j) + matrix.get(i,j));
            }
            arr.push(_arr);
        }
        return new Matrix(arr);
    }
    multiplyNumber(number) {
        let row = this.rowCount;
        let column = this.columnCount;
        let arr = [];
        for (let i = 0;i < row;i++) {
            let _arr = [];
            for (let j = 0;j < column;j++) {
                _arr.push(this.get(i,j) * number);
            }
            arr.push(_arr);
        }
        return new Matrix(arr);
    }
    // 转置
    transpose() {
        let arr = [];
        for(let i = 0;i < this.columnCount;i++) {
            arr.push(this.getColumn(i));
        }
        return new Matrix(arr);
    }
    // 矩阵乘法
    multiply(matrix) {
        if (this.columnCount !== matrix.rowCount) {
            throw new Error("矩阵无法相乘");
        }
        let arr = [];
        for(let i = 0;i < this.rowCount;i++) {
            let row = this.getRow(i);
            let _arr = [];
            for(let j = 0;j < matrix.columnCount;j++) {
                let column = matrix.getColumn(j);
                let sum = 0;
                row.forEach((num,k) => {
                    sum += num * column[k]
                });
                _arr.push(sum);
            }
            arr.push(_arr);
        }
        return new Matrix(arr);
    }
    // 简约化矩阵
    simplify() {
        let data2D = this.to2DArray();
        /*let row = data2D.reduce((row1,row2) => {
            if(Math.abs(row1[0]) > Math.abs(row2[0])) {
                return row1;
            }
            return row2;
        });
        let i = data2D.indexOf(row);
        data2D.splice(i,1);
        data2D.unshift(row);*/
        for(let col = 0;col < data2D[0].length;col++) {
            let referenceRow = data2D[col];
            if(!referenceRow) {
                break;
            }
            referenceRow = referenceRow.map(num => {
                if (num === 0) {
                    return 0;
                }
                if (referenceRow[col] === 0) {
                    return Number.MAX_SAFE_INTEGER;
                }
                return num / referenceRow[col];
            });
            data2D[col] = referenceRow;
            for(let rowIndex = 0;rowIndex < data2D.length;rowIndex++) {
                if(rowIndex !== col) {
                    let times;
                    if(data2D[rowIndex][col] === 0) {
                        times = 0;
                    }else if(referenceRow[col] === 0) {
                        times = Number.MAX_SAFE_INTEGER;
                    } else {
                        times = data2D[rowIndex][col] / (referenceRow[col]);
                    }
                    data2D[rowIndex] = data2D[rowIndex].map((num,_col) => {
                        return num - (referenceRow[_col] * (times));
                    });
                }
            }
        }
        return new Matrix(data2D);
    }
    toCSSMatrixArray() {
        const data = this.data;
        return [data[0],data[1],data[3],data[4],data[6],data[7]];
    }
    toCSSString() {
        if(!this.isSquare()) {
            throw new Error("不是方形矩阵");
        }
        if(this.rowCount === 3) {
            const data = this.data;
            return `matrix(${data[0]},${data[1]},${data[3]},${data[4]},${data[6]},${data[7]})`;
        }
        if(this.rowCount === 4) {

        }
        throw new Error("不是三维或四维矩阵")
    }
}
Matrix.init = function(dimension) {
    return Matrix.unitMatrix(dimension);
}
Matrix.resolveFormulaGroup = function(group) {
    let m = new Matrix(group);
    m = m.simplify();
    let ret = m.to2DArray().map(row => {
        return row[row.length-1];
    });
    return ret;
};
Matrix.unitMatrix = function(dimension) {
    let arr = [];
    for(let i = 0;i < dimension;i++) {
        let _arr = [];
        for(let j = 0;j < dimension;j++) {
            if (i === j) {
                _arr.push(1);
            } else {
                _arr.push(0);
            }
        }
        arr.push(_arr);
    }
    return new Matrix(arr);
};

Matrix.translate = function(x = 0,y = 0) {
    const arr = [[1, 0, 0], [0, 1, 0], [x, y, 1]];
    return new Matrix(arr);
};
Matrix.scale = function(x,y,origin = {x:0,y:0}) {
    if (y === undefined) {
        y = x;
    }
    const arr = [[x, 0, 0], [0, y, 0], [0, 0, 1]];
    const m1 = Matrix.translate(-origin.x,-origin.y);
    const scaleMatrix = new Matrix(arr);
    let m2 = Matrix.translate(origin.x,origin.y);
    return m1.multiply(scaleMatrix).multiply(m2);
};
Matrix.rotate = function (radian, origin = {x:0,y:0}) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const m1 = Matrix.translate(-origin.x,-origin.y);
    const m = new Matrix([[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]]);
    let m2 = Matrix.translate(origin.x,origin.y);
    return m1.multiply(m).multiply(m2);
};
Matrix.skew = function(xRadian,yRadian,origin = {x:0,y:0}) {
    let m1 = Matrix.translate(-origin.x,-origin.y);
    let arr = [[1,Math.tan(yRadian),0],[Math.tan(xRadian),1,0],[0,0,1]];
    let m = new Matrix(arr);
    let m2 = Matrix.translate(origin.x,origin.y);
    return m1.multiply(m).multiply(m2);
};
Matrix.fromArrayRowColumn = function(arr, row,column) {
    if (arr.length !== row * column) {
        throw new Error("data 数字无法对应");
    }
    let m = new Matrix([[]]);
    m.data = arr;
    m.columnCount = column;
    m.rowCount = row;
    return m;
}
Matrix.fromCSSTransform = function (string) {
    // 以0,0 点为变换基点
    let _str = string.replace(/\s/g,"");
    let REG = /(matrix|translate|translateX|translateY|scale|scaleX|scaleY|skew|skewX|skewY|rotate)\(([^\(\)]+)\)/ig;
    let RET = REG.exec(_str);
    let curMatrix = Matrix.init(3);
    while (RET) {
        let method = RET[1];
        switch (method.toLowerCase()) {
            case "matrix": {
                const m = Matrix.init(3);
                const _data = RET[2].split(/[\s,]+/).map(parseFloat);
                const data = m.data;
                data[0] = _data[0];
                data[1] = _data[1];
                data[3] = _data[2];
                data[4] = _data[3];
                data[6] = _data[4];
                data[7] = _data[5];
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "translate": {
                let numbers = (RET[2].split(/[,\s]+/).map(parseFloat));
                if(numbers.length === 1) {
                    numbers.push(0)
                }
                const m = Matrix.translate(numbers[0],numbers[1]);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "translatex": {
                const val = parseFloat(RET[2]);
                const m = Matrix.translate(val);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "translatey": {
                const val = parseFloat(RET[2]);
                const m = Matrix.translate(0,val);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "scale": {
                let numbers = (RET[2].split(/[,\s]+/).map(parseFloat));
                if(numbers.length === 1) {
                    numbers.push(numbers[0]);
                }
                const [scaleX, scaleY] = numbers;
                const m = Matrix.scale(scaleX,scaleY);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "scalex": {
                const val = parseFloat(RET[2]);
                const m = Matrix.scale(val,1);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "scaley": {
                const val = parseFloat(RET[2]);
                const m = Matrix.scale(1,val);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "rotate": {
                const val = parseFloat(RET[2]);
                const m = Matrix.rotate(val);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "skew": {
                let numbers = (RET[2].split(/[,\s]+/).map(parseFloat));
                if(numbers.length === 1) {
                    numbers.push(0);
                }
                const [xdeg, ydeg] = numbers;
                const m = Matrix.skew(xdeg,ydeg);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "skewx": {
                const val = parseFloat(RET[2]);
                const m = Matrix.skew(val,0);
                curMatrix = curMatrix.multiply(m);
                break;
            }
            case "skewy": {
                const val = parseFloat(RET[2]);
                const m = Matrix.skew(0,val);
                curMatrix = curMatrix.multiply(m);
                break;
            }
        }
        RET = REG.exec(_str);
    }
    return curMatrix;
};
export default Matrix;
