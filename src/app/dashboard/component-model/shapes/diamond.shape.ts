import { ModelShape } from './model.shape';
import { Shape, Group, Circle, Star } from "konva";

export class DiamondShape extends ModelShape {

    public constructor(callback) {
        super(callback);
        this.name = 'Diamond';
        this.type = 'Diamond';
    }

    public createShape(x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
        let shape = new Star({
            x : 0,
            y : 0,
            numPoints: 4,
            innerRadius: 40,
            outerRadius: 70,
            fill: this.getHeaderColor().toString(),
            stroke: 'black'
        })

        return shape;
    }

    public getTitlePosition() {
        return {x: -50, y: -5};
    }


    public getHeaderColor(): String {
        return '#e85f64';
    }

    public clone() {
        let obj = new DiamondShape(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }
}