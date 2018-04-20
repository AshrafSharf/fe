import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';
import { Template, TemplateInterface } from './templates';

export class ComponentTemplate extends Template {

    private containerWidth = 150;
    private interfaceContainerHeight = 40;

    public constructor(callback) {
        super(callback);
        this.name = 'Component';
        this.type = 'ComponentTemplate';
    }

    public getTitle():string {
        return this.name.toString();
    }

    public createUI(x = Math.random() * 300, y = Math.random() * 300, isDraggable?, fontSize = 13) {
        if (isDraggable != null){
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
        this.uiGroup.add(this.createConnectors());

        this.uiGroup.on('click', (event) => {
            this.onMouseButton(event);
        });

        this.uiGroup.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
            this.showConnectors();
        });
        this.uiGroup.on('mouseout', () => {
            document.body.style.cursor = 'default';
            this.hideConnectors();
        });

        this.uiGroup.on('dragend', () => {
            console.log('dragend');
        });

        this.uiGroup.on('dragstart', () => {
            console.log('dragstart');
        });
        this.uiGroup.on('dragmove', () => {
            console.log('dragmove');
            this.callback.drawConnections();
        });
        
        return this.uiGroup;
    }

    public hideConnectors() {
        if (this.connectors.topConnector) this.connectors.topConnector.hide();
        if (this.connectors.leftConnector) this.connectors.leftConnector.hide();
        if (this.connectors.rightConnector) this.connectors.rightConnector.hide();
        if (this.connectors.bottomConnector) this.connectors.bottomConnector.hide();
    }

    public showConnectors() {
        this.connectors.topConnector.show();
        this.connectors.leftConnector.show();
        this.connectors.rightConnector.show();
        this.connectors.bottomConnector.show();
    }
    
    private createConnectors() {
        let group = new Group({ x: 0, y: 40 });

        let count = this.interfaces.length == 0 ?  1 : this.interfaces.length;
        let height = this.interfaceContainerHeight * this.interfaces.length;
        let y = (height / 2) - (this.interfaceContainerHeight / 2);

        this.connectors.topConnector = new RegularPolygon({
            x : this.getWidth() / 2,
            y : -50,
            sides: 3,
            radius: 10,
            fill: 'blue'
        });

        this.connectors.leftConnector = new RegularPolygon({
            x : -10,
            y : y,
            sides: 3,
            radius: 10,
            fill: 'blue'
        });
        this.connectors.leftConnector.rotate(-90);

        this.connectors.bottomConnector = new RegularPolygon({
            x : this.getWidth() / 2,
            y : height + 10,
            sides: 3,
            radius: 10,
            fill: 'blue'
        });
        this.connectors.bottomConnector.rotate(180);

        this.connectors.rightConnector = new RegularPolygon({
            x : this.containerWidth + 10,
            y : y,
            sides: 3,
            radius: 10,
            fill: 'blue'
        });
        this.connectors.rightConnector.rotate(90);

        group.add(this.connectors.topConnector);
        group.add(this.connectors.leftConnector);
        group.add(this.connectors.bottomConnector);
        group.add(this.connectors.rightConnector);

        // add click handler
        this.connectors.topConnector.on('mousedown', (e) => {
            e.cancelBubble = true;
            this.startArrow(this.connectors.topConnector);
        });
        this.connectors.bottomConnector.on('mousedown', (e) => {
            e.cancelBubble = true;
            this.startArrow(this.connectors.bottomConnector);
        });
        this.connectors.leftConnector.on('mousedown', (e) => {
            e.cancelBubble = true;
            this.startArrow(this.connectors.leftConnector);
        });
        this.connectors.rightConnector.on('mousedown', (e) => {
            e.cancelBubble = true;
            this.startArrow(this.connectors.rightConnector);
        });
        

        // hide by default
        this.hideConnectors();

        return group;
    }

    private startArrow(connector) {
        this.callback.drawArrow(connector);
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
            text: this.getTitle(),
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

    public clone() {
        let obj = new ComponentTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        return obj;
    }


    public getType(): String {
        return 'Generic Micro Service';
    }

    public getHeaderColor(): String {
        return 'lightgray';
    }
}