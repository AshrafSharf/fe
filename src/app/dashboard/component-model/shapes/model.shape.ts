import { Shape, Group, Rect, Text} from "konva";
import { Template } from "../templates/templates";

export abstract class ModelShape extends Template {

    private containerWidth = 50;
    private interfaceContainerHeight = 40;

    public constructor(callback) {
        super(callback);
    }

    public getTitle():string {
        return this.name.toString();
    }

    public abstract createShape();

    public createUI(x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
        this.uiGroup = new Group({
            x : x,
            y : y,
            draggable: true
        })

        this.uiGroup.add(this.createShape());
        this.uiGroup.add(this.createTitle());

        this.uiGroup.on('click', (event) => {
            this.onMouseButton(event);
        });
     
        this.uiGroup.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });
        this.uiGroup.on('mouseout', function() {
            document.body.style.cursor = 'default';
        });

        return this.uiGroup;
    }

    private createTitle(fontSize = 13) {
        let group = new Group({ x: 0, y: 0 });

        let position = this.getTitlePosition();
        let label = new Text({
            x : position.x,
            y : position.y,
            width: this.containerWidth * 2,
            align: 'center',
            text: this.name.toString(),
            fontSize: fontSize,
            fontStyle: 'bold',
            fill: 'black'
        });

        group.add(label);

        return group;
    }

    public abstract getTitlePosition(): { x: number, y: number };


    public getType(): String {
        return "Circle"
    }

    public canAddInterface() {
        return false;
    }

    public getHeaderColor(): String {
        return 'red';
    }

}
