import { ModelShape } from './model.shape';
import { Shape, Group, Circle, RegularPolygon } from "konva";

export class TriangleShape extends ModelShape {

    public constructor(callback) {
        super(callback);
        this.name = 'Triangle';
        this.type = 'Triangle';
    }

    public createShape(x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
        let shape = new RegularPolygon({
            x : 0,
            y : 0,
            sides: 3,
            radius: 50,
            fill: this.getHeaderColor().toString(),
            stroke: 'black'
        })

        return shape;
    }

    public getTitlePosition() {
        return {x: -50, y: -5};
    }

    public getHeaderColor(): String {
        return '#fcbd76';
    }

    public clone() {
        let obj = new TriangleShape(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }
}