import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';
import { Template, TemplateInterface } from './templates';

export class GenericMicroServiceTemplate extends Template {

    private containerWidth = 230;
    private containerHeight = 200;
    private interfaceContainerHeight = 60;

    public constructor(callback) {
        super(callback);
        this.name = '';
    }

    public createUI(x = Math.random() * 600, y = Math.random() * 600, fontSize = 15) {

        this.uiGroup = new Group({
            x : x,
            y : y,
            draggable: true
        })

        this.uiGroup.add(this.createContainer());
        this.uiGroup.add(this.createTitle());
        this.uiGroup.add(this.createInterfaceContainer(fontSize));

        this.uiGroup.on('click', (event) => {
            this.onMouseButton(event);
        });
     
        return this.uiGroup;
    }

    private addCloseButton() {
        
    }

    private createTitle(fontSize = 15) {
        let group = new Group({ x: 0, y: 0 });

        let titleRect = new Rect({
            x : 0,
            y : 0,
            width : this.containerWidth,
            height : 40,
            stroke : 'black',
            fill:'lightgray'
        });

        let label = new Text({
            x : 10,
            y : 10,
            width: this.containerWidth - 20,
            align: 'center',
            text: this.name.toString(),
            fontSize: fontSize + 2,
            fontStyle: 'bold',
            fill: 'black'
        });

        group.add(titleRect);
        group.add(label);

        return group;
    }

    private createInterfaceContainer(fontSize) {
        let group = new Group({ x: 0, y: 40 });

        for (let index = 0; index < this.interfaces.length; index++) {
            let intf = this.interfaces[index];
            let y = index * this.interfaceContainerHeight;

            let rect = new Rect({
                x : 0,
                y : y,
                width : this.containerWidth,
                height : this.interfaceContainerHeight,
                stroke : 'black'
            })

            let circleLeft = new Circle({
                x : 0,
                y : y + (this.interfaceContainerHeight / 2),
                radius: 5,
                fill: 'red',
                stroke : 'black'
            });

            let circleRight = new Circle({
                x : this.containerWidth,
                y : y + (this.interfaceContainerHeight/2),
                radius: 5,
                fill: 'red',
                stroke : 'black'
            });

            let label = new Text({
                x : 10,
                y : y + 10,
                height: this.interfaceContainerHeight / 2 - 20,
                align: 'center',
                text: intf.name.toString(),
                fontSize: fontSize,
                fill: 'black'
            });

            group.add(rect);
            group.add(circleLeft);
            group.add(circleRight);
            group.add(label);
        }

        return group;
    }

    private createContainer() {

        let height = 40 + this.interfaces.length * this.interfaceContainerHeight;

        // outer rect
        let rect = new Rect({
            x : 0,
            y : 0,
            width : this.containerWidth,
            fill: 'white',
            height : height,
            stroke : 'black'
        })
        return rect;
    }

    private onMouseButton(event) {
        this.callback.templateClicked(this);
        event.cancelBubble = true;
    }

    public clone() {
        let obj = new GenericMicroServiceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }

    public reloadUI() {

        let x = this.uiGroup.x();
        let y = this.uiGroup.y();

        // remove the older contents
        this.uiGroup.remove;

        // rebuild the ui
        return this.createUI(x, y);
    }
}