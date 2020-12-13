import Hammer from "hammerjs";
import Point from "../../math/geometry/base/Point";
import Circle from "../Circle";
import Matrix from "../../math/Matrix";

class EventManager{
    constructor() {
        this.bindings = {
            "click": [],
            "panstart": [],
            "panmove": [],
            "panend": [],
        }
    }
    registerMovable(cmp) {
        this.bindEvent("panstart", cmp,(point) => {
            this._start = point;
            this._startMatrix = cmp.getMatrix();
        })
        this.bindEvent("panmove", null,(point) => {
            if (this._start) {
                let delta = {
                    x: point.x - this._start.x,
                    y: point.y - this._start.y
                }
                let m = Matrix.translate(delta.x,delta.y)
                cmp.updateMatrix(this._startMatrix.copy().multiply(m));
                this.scene.draw();
            }
        })
        this.bindEvent("panend", null,() => {
            this._start = null
            this._startMatrix = null
        })
    }
    wholeMovable() {
        this.bindEvent("panstart", null,(point) => {
            this._start = point;
        })
        this.bindEvent("panmove", null,(point) => {
            if (this._start) {
                let delta = {
                    x: point.x - this._start.x,
                    y: point.y - this._start.y
                }
                let m = Matrix.translate(delta.x,delta.y);
                this.scene.eachLayer((layer) => {
                    layer.applyInnerMatrix(m);
                })
                this.scene.draw();
                this._start = point
            }
        })
        this.bindEvent("panend", null,() => {
            this._start = null
        })
    }
    init(scene){
        this.scene = scene;
        let container = scene.container;
        const hammer = new Hammer(container);
        let me = this;
        function runHandler(e,eventName, handler) {
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = e.center
            let relative = new Point(_x - x,_y - y);
            for(let name in scene.layers) {
                let layer = scene.layers[name];
                let _point = layer.coord.getPointFromOriginSystem(relative);
                if (handler) {
                    handler(_point);
                }
                me.bindings[eventName].forEach(item => {
                    let {
                        entity,handler
                    } = item
                    if (entity) {
                        if (entity.isInArea(_point)) {
                            handler.call(entity,_point);
                        }
                    } else {
                        handler(_point);
                    }
                })
            }
        }

        hammer.on("tap",(e) => {
            runHandler(e,"click",(_point) => {
                let circle = new Circle({
                    cx: _point.x,
                    cy: _point.y,
                    r: 10
                },{
                    fill: "red"
                })
                scene.addComponent(circle);
                scene.draw();
            });
        })
        hammer.on("panstart", (e) => {
            runHandler(e,"panstart");
        })
        hammer.on("panmove", (e) => {
            runHandler(e,"panmove");
        });
        hammer.on("panend", (e) => {
            runHandler(e,"panend");
        })
    }
    bindEvent(eventName,entity,handler) {
        if (this.bindings[eventName]) {
            this.bindings[eventName].push({
                entity,handler
            });
        } else {
            console.warn(`不支持${eventName}事件`)
        }
    }
    unbind(eventName,entity,handler) {
        if (this.bindings[eventName]) {
            let toDelete = []
            this.bindings[eventName].forEach((item,index) => {
                if (item.entity === entity) {
                    if (item.handler === handler || !handler){
                        toDelete.push(index)
                    }
                }
            });
            toDelete.forEach(i => {
                this.bindings[eventName].splice(i,1);
            })
        }
    }
}
export default EventManager;
