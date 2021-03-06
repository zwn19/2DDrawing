/* eslint-disable */
import Hammer from "hammerjs";
import Point from "../../math/geometry/base/Point";
import Circle from "../Circle";
import Matrix from "../../math/Matrix";
import Group from "../Group";

class EventManager{
    constructor() {
        this.bindings = {
            "click": [],
            "panstart": [],
            "panmove": [],
            "panend": [],
            "mouseMove": [],
            "mouseIn": [],
            "mouseOut": [],
        }
    }
    addTooltip(cmp,tooltip) {
        if(!this._tooltip) {
            let container = this.scene.container;
            this._tooltip = document.createElement('div');
            Object.assign(this._tooltip.style , {
                'position': 'absolute',
                'border': '1px solid #eee',
                'border-radius': '5px',
                'padding': '5px',
                'zIndex': '5',
                'background': '#fff',
                'display': 'none'
            });
            container.appendChild(this._tooltip);
        }
        this.bindEvent("mouseIn", cmp,() => {
            console.log('mouseIn');
            let p = cmp.getCenter();
            let layer = this.scene.findLayer((l) => {
                return l.contains(cmp)
            });
            let point = layer.coord.getPointInOriginSystem(p);
            Object.assign(this._tooltip.style , {
                left: `${point.x}px`,
                top: `${point.y}px`,
                display: 'block'
            });
            if (typeof tooltip === 'function') {
                this._tooltip.innerHTML = tooltip();
            } else {
                this._tooltip.innerHTML = tooltip
            }
        });
        this.bindEvent("mouseOut", cmp,(point) => {
            console.log('mouseOut');
            Object.assign(this._tooltip.style , {
                display: 'none'
            });
        });
    }

    selectable(cmp) {
        if (Array.isArray(cmp)) {
            cmp.forEach(c => {
                this.selectable(c);
            });
        } else {

        }
    }

    registerMovable(cmp) {
        this.bindEvent("panstart", cmp,(point) => {
            this._start = point;
            this._startMatrix = cmp.getMatrix();
        })
        this.bindEvent("panmove", cmp,(point) => {
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
        this.scene.eachLayer((layer) => {
            let wrapper = new Group({
                id: 'transform-wrapper'
            });
            wrapper.addChildren(layer.root.children);
            layer.root.children = [];
            layer.root.addChild(wrapper);
            this.registerMovable(wrapper);
        });
    }
    init(scene){
        this.scene = scene;
        let container = scene.container;
        const hammer = new Hammer(container);
        let me = this;
        function runHandler(e,eventName) {
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = e.center
            let relative = new Point(_x - x,_y - y);
            me.bindings[eventName].forEach(item => {
                let {
                    entity,handler
                } = item
                if (entity) {
                    let layer = scene.findLayer((l) => {
                        return l.contains(entity)
                    })
                    let point = layer.coord.getPointFromOriginSystem(relative);
                    if (entity.isInArea(point)) {
                        handler.call(entity,point);
                    }
                }else {
                    handler(relative);
                }
            })
        }
        hammer.on("tap",(e) => {
            runHandler(e,"click");
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = e.center
            let relative = new Point(_x - x,_y - y);
            let layer = scene.getLayer();
            let _point = layer.coord.getPointFromOriginSystem(relative);
            let circle = new Circle({
                cx: _point.x,
                cy: _point.y,
                r: 10
            },{
                fill: "red"
            })
            scene.addComponent(circle);
            scene.draw();
        })
        hammer.on("panstart", (e) => {
            runHandler(e,"panstart");
        })
        hammer.on("panmove", (e) => {
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = e.center
            let relative = new Point(_x - x,_y - y);
            me.bindings['panmove'].forEach(item => {
                let {
                    entity,handler
                } = item
                if (entity) {
                    let layer = scene.findLayer((l) => {
                        return l.contains(entity)
                    })
                    let point = layer.coord.getPointFromOriginSystem(relative);
                    handler.call(entity,point);
                }else {
                    handler(relative);
                }
            })
        });
        hammer.on("panend", (e) => {
            runHandler(e,"panend");
        });
        let hoverEntity;
        container.addEventListener('mousemove',(e) => {
            let _e = {
                x: e.pageX,
                y: e.pageY
            };
            let {x,y} = container.getBoundingClientRect();
            let {
                x: _x,y: _y
            } = _e
            let relative = new Point(_x - x,_y - y);
            me.bindings['mouseIn'].forEach(item => {
                let {
                    entity,handler
                } = item;
                if (entity) {
                    let layer = scene.findLayer((l) => {
                        return l.contains(entity)
                    });
                    let point = layer.coord.getPointFromOriginSystem(relative);
                    if (entity.isInArea(point)) {
                        if (!hoverEntity) {
                            handler.call(entity,point);
                            hoverEntity = entity;
                        }
                    }
                }
            });
            me.bindings['mouseOut'].forEach(item => {
                if (hoverEntity) {
                    let {
                        entity,handler
                    } = item
                    if (hoverEntity === entity) {
                        let layer = scene.findLayer((l) => {
                            return l.contains(entity)
                        })
                        let point = layer.coord.getPointFromOriginSystem(relative);
                        if (!entity.isInArea(point)) {
                            handler.call(entity,point);
                            hoverEntity = null;
                        }
                    }
                }
            });
            me.bindings['mouseMove'].forEach(item => {
                if (hoverEntity) {
                    let {
                        entity,handler
                    } = item
                    if (hoverEntity === entity) {
                        let layer = scene.findLayer((l) => {
                            return l.contains(entity)
                        })
                        let point = layer.coord.getPointFromOriginSystem(relative);
                        if (entity.isInArea(point)) {
                            handler.call(entity,point);
                        }
                    }
                }
            });
        });
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
