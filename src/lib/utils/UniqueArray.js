import { isEqual } from "./index"
class UniqueArray extends Array{

    constructor(items,comparator) {
        super();
        this.comparator = comparator || isEqual;
        if (items) {
            this.push(...items);
        }
    }

    push(...items) {
        items.forEach(i => {
            if (!this.contains(i)) {
                super.push(i);
            }
        });

    }

    unshift(...items) {
        items.forEach(i => {
            if (!this.contains(i)) {
                super.unshift(i);
            }
        });
    }

    concat(...items) {
        let _ret = this.copy();
        items.forEach(arr => {
            _ret.push(...arr);
        });
        return _ret;
    }

    copy() {
        return new UniqueArray(this);
    }

    contains(item) {
        return !!this.find(i => this.comparator(item,i));
    }

    toArray() {
        return [...this]
    }
}

export default UniqueArray;
