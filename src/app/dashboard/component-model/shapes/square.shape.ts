import { ModelShape } from './model.shape';
import { Shape, Group, Circle, Rect } from "konva";

export class SquareShape extends ModelShape {

    public constructor(callback) {
        super(callback);
        this.name = 'Square';
        this.type = 'Square';
    }

    public createShape(x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
        let shape = new Rect({
            x : 0,
            y : 0,
            width: 100,
            height: 100,
            fill: this.getHeaderColor().toString(),
            stroke: 'black'
        })

        return shape;
    }

    public getTitlePosition() {
        return {x: 0, y: 40};
    }

    public getHeaderColor(): String {
        return '#8974b7';
    }

    public clone() {
        let obj = new SquareShape(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }
}