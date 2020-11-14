/* eslint-disable */
class DynamicProgrammingTable {
    constructor(capacity, rowValues, unitOpacity = 1) {
        const rowCount = rowValues.length
        const columnCount = capacity / unitOpacity
        const table = []
        for (let i = 0; i < rowCount; i++) {
            const row = []
            for (let j = 0; j < columnCount; j++) {
                row.push({
                    value: 0,
                    indices: []
                })
            }
            table.push(row)
        }
        this.table = table
        this.rowValues = rowValues
        this.unitOpacity = unitOpacity
    }
    getValue(row, column) {
        if (this.table[row] && this.table[row][column]) {
            return this.table[row][column].value
        }
        return 0
    }
    getIndices(row, column) {
        if (this.table[row] && this.table[row][column]) {
            return this.table[row][column].indices
        }
        return []
    }
    updateRow(rowIndex) {
        const value = this.rowValues[rowIndex]
        const row = this.table[rowIndex]
        row.forEach((item, columnIndex) => {
            const cap = (columnIndex + 1) * this.unitOpacity
            const preValue = this.getValue(rowIndex - 1, columnIndex)
            if (cap >= value.capacity) {
                const leftCap = cap - value.capacity
                const _value = this.getValue(rowIndex - 1, leftCap / this.unitOpacity - 1) + value.value
                if (preValue > _value) {
                    item.value = preValue
                    item.indices = [...this.getIndices(rowIndex - 1, columnIndex)]
                } else {
                    item.value = _value
                    item.indices = [...this.getIndices(rowIndex - 1, leftCap / this.unitOpacity - 1), rowIndex]
                }
            } else {
                item.value = this.getValue(rowIndex - 1, columnIndex)
                item.indices = [...this.getIndices(rowIndex - 1, columnIndex)]
            }
        })
    }
    calculate() {
        const count = this.table.length
        let current = 0
        while (current < count) {
            this.updateRow(current)
            current++
        }
    }
}

export default DynamicProgrammingTable;
