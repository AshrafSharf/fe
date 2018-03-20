import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';
import { Template, TemplateInterface } from './templates';

export class GenericMicroServiceTemplate extends Template {

    private containerWidth = 150;
    private interfaceContainerHeight = 40;

    public constructor(callback) {
        super(callback);
        this.name = 'Generic Micro Service';
        this.type = 'GenericMicroServiceTemplate';
    }

    public createUI(isDraggable?, x = Math.random() * 600, y = Math.random() * 600, fontSize = 13) {
            if (isDraggable !=null){
                this.uiGroup = new Group({
                    x : x,
                    y : y,
                    draggable: isDraggable
                })
            }
            else{
                this.uiGroup = new Group({
                    x : x,
                    y : y,
                    draggable: true
                })
            }
        
       

        this.uiGroup.add(this.createContainer());
        this.uiGroup.add(this.createTitle());
        this.uiGroup.add(this.createInterfaceContainer(fontSize));

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

    private addCloseButton() {
        
    }

    private createTitle(fontSize = 13) {
        let group = new Group({ x: 0, y: 0 });

        let titleRect = new Rect({
            x : 0,
            y : 0,
            width : this.containerWidth,
            height : this.interfaceContainerHeight,
            stroke : 'black',
            fill: this.getHeaderColor().toString()
        });

        let label = new Text({
            x : 0,
            y : 10,
            width: this.containerWidth,
            align: 'center',
            text: this.name.toString(),
            fontSize: fontSize,
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

            if (intf.properties.length > 0) {
                let circleLeft = new Circle({
                    x : 0,
                    y : y + (this.interfaceContainerHeight / 2),
                    radius: 5,
                    fill: 'white',
                    stroke : 'black'
                });
                group.add(circleLeft);
            }

            if (intf.downstreamInterfaces.length > 0) {
                let circleRight = new Circle({
                    x : this.containerWidth,
                    y : y + (this.interfaceContainerHeight/2),
                    radius: 5,
                    fill: 'white',
                    stroke : 'black'
                });
                group.add(circleRight);
            }
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

    public getType(): String {
        return 'Generic Micro Service';
    }

    public getHeaderColor(): String {
        return 'lightgray';
    }
}