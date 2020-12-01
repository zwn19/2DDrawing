import Hammer from "hammerjs";
import Point from "../../math/geometry/Point";
import Circle from "../Circle";

class EventManager{
    constructor() {
        this.bindings = {
            "click": [],
        }
    }
    init(scene){
        let container = scene.container;
        const hammer = new Hammer(container);
        hammer.on("tap",(e) => {
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = e.center
            let relative = new Point(_x - x,_y - y);
            for(let name in scene.layers) {
                let layer = scene.layers[name];
                let _point = layer.coord.getPointFromOriginSystem(relative);
                let circle = new Circle({
                    cx: _point.x,
                    cy: _point.y,
                    r: 10
                },{
                    fill: "red"
                })
                layer.root.addChild(circle);
                layer.root.eachChild((entity) => {
                    if (entity.isInArea(_point)) {
                        console.log(entity);
                    }
                });
                this.bindings["click"].forEach(item => {
                    let {
                        entity,handler
                    } = item
                    if (entity.isInArea(_point)) {
                        handler.call(entity,_point);
                    }
                })
            }
            scene.draw();
        })
    }
    bindEvent(eventName,entity,handler) {
        if (this.bindings[eventName]) {
            this.bindings[eventName].push({
                entity,handler
            });
        }
        console.warn(`不支持${eventName}事件`)
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
