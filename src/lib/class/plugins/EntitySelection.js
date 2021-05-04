import LineSegment from "../../math/geometry/curve/LineSegment";

class EntitySelection {
    constructor(mode = 'single') {
        this.mode = mode;
        this.selections = [];
        this.name = 'selection';
    }
    init(scene){
        let layer = scene.addLayer('selections');
        this.scene = scene;
        this.layer = layer;
    }
    clearSelection() {
        this.layer.clearComponents();
    }
    select(entity) {
        if (this.mode === 'single') {
            this.selections = [entity];
        } else {
            this.selections.push(entity);
        }
    }
    refresh() {
        this.clearSelection();
        this.selections.forEach(c => {
            this.layer.addComponent(c);
        });
    }
}

class EntityOutline {
    constructor(entity) {
        let lines,entityLines = [];
        if(entity.isGroup()) {
            lines = [];
            entity.children.forEach(c => {
                lines = lines.concat(c.getBoundaries());
            });
        }else {
            lines = entity.getBoundaries();
        }
        lines.forEach(line => {
            let pixRatio = 2;
            let _line = line.getNormalLine(line.start);
            let normalPoints = _line.deltaDistancePoint(line.start, 2 * pixRatio);
            const b1 = new LineSegment(normalPoints[0], normalPoints[1]);
            _line = line.getNormalLine(line.end);
            normalPoints = _line.deltaDistancePoint(line.end, 2 * pixRatio);
            const b2 = new LineSegment(normalPoints[0], normalPoints[1]);
            const polygonPoints = [b1.start, b1.end, b2.start, b2.end];
            const polygonPointsStr = polygonPoints.map(p => `${p.x},${p.y}`).join(" ");
            const entityLine = getSVGElement(`<polygon points="${polygonPointsStr}" fill="#000000"></polygon>`);
            entityLines.push(entityLine);
        });
    }
}
