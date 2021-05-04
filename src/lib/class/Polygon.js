/* eslint-disable */
import Entity from "./Entity";
import Polygon2d from "../math/geometry/2d/Polygon";
import Vector from "../math/geometry/base/Vector";
import Angle from "../math/geometry/2d/Angle";
import UniqueArray from "../utils/UniqueArray";
import { sortPoints } from "../math/utils";
import Path from "./Path";

class Polygon extends Entity{
    constructor(attrs, style) {
        super(attrs, style);
        this.tagName = "polygon";
        let points = [];
        if (this.props.points) {
            this.props.points.split(" ").forEach(pair => {
                if(pair.trim()){
                    let [x,y] = pair.split(",");
                    points.push({x,y});
                }
            });
            this.geometry = new Polygon2d(points);
        }
    }
    chamfer(point,len1,len2) {
        let points = this.getPoints();
        let index = points.findIndex(p => p.equals(point));
        points = this.geometry.getPoints();
        let pre = points[index - 1] || points[points.length-1];
        let next = points[index + 1] || points[0];
        let cur = points[index];
        let vec1 = Vector.fromTwoPoints(cur,next);
        let vec2 = Vector.fromTwoPoints(cur,pre);
        let p1 = vec1.getPoint(cur,len1);
        let p2 = vec2.getPoint(cur,len2);
        let _points = [...points];
        _points.splice(index,1,p2,p1);
        let props = { ...this.props };
        props.points = _points.map(p => p.toString()).join(" ");
        return new Polygon(props,this.style);
    }
    chamferAll(len1,len2) {
        let points = this.geometry.getPoints();
        let _points = [];
        points.forEach((p,index) => {
            let pre = points[index - 1];
            let next = points[index + 1];
            if (!pre) {
                pre = points[points.length - 1];
            }
            if (!next) {
                next = points[0];
            }
            let vec1 = Vector.fromTwoPoints(p,next);
            let vec2 = Vector.fromTwoPoints(p,pre);
            let p1 = vec1.getPoint(p,len1);
            let p2 = vec2.getPoint(p,len2);
            _points.push(p2,p1);
        });
        let props = {...this.props }
        props.points = _points.map(p => p.toString()).join(" ");
        return new Polygon(props,this.style);
    }
    round(point,radius1,radius2) {
        let radius = radius1;
        let points = this.getPoints();
        let index = points.findIndex(p => p.equals(point));
        points = this.geometry.getPoints();
        let pre = points[index - 1] || points[points.length-1];
        let next = points[index + 1] || points[0];
        let cur = points[index];
        let vec1 = Vector.fromTwoPoints(cur,pre);
        let vec2 = Vector.fromTwoPoints(cur,next);
        let ang = new Angle(point,vec1,vec2);
        let { p1, p2 } = ang.round(radius);
        let cmds = [];
        let points1 = points.slice(0,index);
        let points2 = points.slice(index + 1,points.length);
        let c = this.geometry.getCenter();
        [...points2,...points1].forEach((p,i) => {
            if (i === 0) {
                let [_p1,_p2] = sortPoints([p1,p2],c);
                cmds.push(`M ${_p1.x} ${_p1.y}`);
                cmds.push(`A ${radius} ${radius} 0 0 1 ${_p2.x} ${_p2.y}`);
            }
            cmds.push(`L ${p.x} ${p.y}`);
        });
        cmds.push("Z");
        let props = { ...this.props };
        props.d = cmds.join(" ");
        delete props.points;
        return new Path(props,this.style);
    }
    roundAll(radius1,radius2) {
        let radius = radius1;
        let points = this.geometry.getPoints();
        let c = this.geometry.getCenter();
        points = sortPoints(points,c);
        let cmds = [];
        points.forEach((cur,i) => {
            let pre = points[i-1] || points[points.length-1];
            let next = points[i+1] || points[0];
            let vec1 = Vector.fromTwoPoints(cur,pre);
            let vec2 = Vector.fromTwoPoints(cur,next);
            let ang = new Angle(cur,vec1,vec2);
            let { p1, p2 } = ang.round(radius);
            if (i === 0) {
                let [_p1,_p2] = sortPoints([p1,p2],c);
                cmds.push(`M ${_p1.x} ${_p1.y}`);
                cmds.push(`A ${radius} ${radius} 0 0 1 ${_p2.x} ${_p2.y}`);
            } else {
                let [_p1,_p2] = sortPoints([p1,p2],c);
                cmds.push(`L ${_p1.x} ${_p1.y}`);
                cmds.push(`A ${radius} ${radius} 0 0 1 ${_p2.x} ${_p2.y}`);
            }
        });
        cmds.push("Z");
        let props = { ...this.props };
        props.d = cmds.join(" ");
        delete props.points;
        return new Path(props,this.style);
    }
}
export default Polygon;
