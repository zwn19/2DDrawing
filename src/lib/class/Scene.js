/* eslint-disable */
import Layer from "./Layer";
import Matrix from "../math/Matrix";

class Scene {
    constructor(container,defaultRoot) {
        this.plugins = [];
        let width = container.scrollWidth;
        let height = container.scrollHeight;
        this.size = {
            width,
            height
        };
        if (defaultRoot) {
            this.layers = {
                default: new Layer(defaultRoot,this.mode, this.size)
            };
        } else {
            this.layers = {
                default: new Layer(this.size,this.mode, this.size)
            };
        }
        this.useSVGMode();
        this.movementMatrix = Matrix.init(3);
        this.container = container;
    }

    getAspectRatio() {
        return this.size.width / this.size.height;
    }

    getPlugin(name) {
        return this.plugins.find(p => p.name === name);
    }

    usePlugin(plugin) {
        this.plugins.push(plugin);
        plugin.init(this);
    }

    setSize({width,height}) {
        this.size.width = parseFloat(width);
        this.size.height = parseFloat(height);
        for(let name in  this.layers) {
            this.layers[name].setContainerSize(this.size);
        }
        this.layers.default.setContentSize(this.size);
    }
    addLayer(name, root) {
        let layer;
        if (root) {
            layer = new Layer(root, this.mode, this.size);
        } else {
            layer = new Layer(this.size, this.mode, this.size);
        }
        layer.setContainerSize(this.size);
        this.layers[name] = layer;
        return layer;
    }
    getLayer(name) {
        if(!name) {
            return this.layers.default;
        }
        if (this.layers[name]) {
            return this.layers[name];
        }
        throw new Error(`不存在"${name}"图层`);
    }
    findLayer(fn) {
        for(let name in  this.layers) {
            if(fn(this.layers[name])){
                return this.layers[name];
            }
        }
    }
    eachLayer(fn) {
        for(let name in  this.layers) {
            fn(this.layers[name]);
        }
    }
    useSVGMode() {
        this.mode = "svg";
        for(let name in  this.layers) {
            this.layers[name].useSVGMode();
        }
    }
    useCanvasMode() {
        this.mode = "canvas";
        for(let name in  this.layers) {
            this.layers[name].useCanvasMode();
        }
    }
    addComponent(cmp,layerName = "default") {
        let layer = this.getLayer(layerName);
        layer.addComponent(cmp);
    }
    draw() {
        for(let name in  this.layers) {
            this.layers[name].draw(this.container, this.movementMatrix);
        }
    }
    compose() {

    }
}
export default Scene;
