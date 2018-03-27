import { ModelShape } from './model.shape';
import { Shape, Group, Circle } from "konva";

export class CircleShape extends ModelShape {

    public constructor(callback) {
        super(callback);
        this.name = 'Circle';
        this.type = 'Circle';
    }

    public createShape(x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
        let circle = new Circle({
            x : 0,
            y : 0,
            radius: 50,
            fill: this.getHeaderColor().toString(),
            stroke: 'black'
        })

        return circle;
    }

    public getTitlePosition() {
        return {x: -50, y: -5};
    }

    public getHeaderColor(): String {
        return 'cyan';
    }

    public clone() {
        let obj = new CircleShape(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }
}