import { Guid } from '../../../shared/guid';
import { Group, Rect, RegularPolygon, Arrow } from 'konva';
import { ComponentModelInterfaceProperty } from '../../../shared/interfaces/component.model';

export class ConnectionVisualProperties {
    public color: string;
    public height: number;
    public width: number;
    public sourceX: number;
    public sourceY: number;
    public targetX: number;
    public targetY: number;
    public shape: string;
}

export class Connection {
    public inputComponentName: String;
    public inputInterfaceName: string;
    public inputModelInterfaceId: string;
    public outputComponentName: String;
    public outputInterfaceName: string;
    public outputModelInterfaceId: string;
    public arrow: Arrow;
    public visualProperties: ConnectionVisualProperties;
    public connectionProperties: ComponentModelInterfaceProperty[] = new Array<ComponentModelInterfaceProperty>();
}

export interface TemplateInterfaceProperty {
    name:String;
    value: String;
}

export interface DownstreamInterface {
    component:String;
    interface:String;
    connectedComponent:String;
    connectedInterface:String;
}

export class TemplateInterface {
    public name:String = '';
    public latency: String = '';
    
    public properties: TemplateInterfaceProperty[] = new Array<TemplateInterfaceProperty>();
    public downstreamInterfaces: DownstreamInterface[] = new Array<DownstreamInterface>();
}

export class Connectors {
    public topConnector: RegularPolygon;
    public leftConnector: RegularPolygon;
    public rightConnector: RegularPolygon;
    public bottomConnector: RegularPolygon;
}

export enum ConnectorType {
    TOP, RIGHT, BOTTOM, LEFT
}

export abstract class Template {
    public identifier: String = '';
    public name: String = '';
    public type: String  = '';
    public modelComponentPropertiesList: TemplateInterfaceProperty[] = new Array<TemplateInterfaceProperty>();
    public interfaces: TemplateInterface[] = Array<TemplateInterface>();
    public fixedProperties: TemplateInterfaceProperty[]= new Array<TemplateInterfaceProperty>();
    protected callback: TemplateEventsCallback;
    public uiGroup:Group = null;
    public connectors:Connectors = new Connectors();
    public connections: Connection[] = new Array<Connection>();

    constructor (callback) {
        this.callback = callback;
        this.identifier = Guid.newGuid().toString();
    }

    public abstract createUI(x, y, draggable?): any;
    public abstract getType(): String;
    public abstract getTitle(): String;
    public abstract getHeaderColor(): String;
    public abstract clone(): Template;

    public cloneWithoutId(): Template {
        var template:Template = this.clone();
        template.identifier = Guid.newGuid().toString();
        for (let index = 0; index < this.connections.length; index++) {
            template.connections.push(this.connections[index]);
        }
        return template;
    }

    public changeOrigin(x, y) {
        this.uiGroup.setAttr('x', x);
        this.uiGroup.setAttr('y', y);
    }
    
    public reloadUI() {

        let x = this.uiGroup.x();
        let y = this.uiGroup.y();

        // remove the older contents
        this.uiGroup.remove;

        // rebuild the ui
        return this.createUI(x, y);
    }

    public canAddInterface() {
        return true;
    }

    public select() {
        let children = this.uiGroup.getChildren();
        if (children.length > 0) {
            let child = children[0] as Rect;
            child.setAttr('stroke', '#006bb3');
            child.setAttr('strokeWidth', '5');
            child.dash([10, 5]);
        }
    }

    public onMouseButton(event) {
        this.select();
        this.callback.templateClicked(this);
        event.cancelBubble = true;
    }

    public getX() {
        return this.uiGroup.getAttr('x');
    }

    public getY() {
        return this.uiGroup.getAttr('y');
    }

    public getWidth() {
        let children = this.uiGroup.getChildren();
        if (children.length > 0) {
            let child = children[0] as Rect;
            return child.getAttr('width');
        }

        return '-';
    }

    public getHeight() {
        let children = this.uiGroup.getChildren();
        if (children.length > 0) {
            let child = children[0] as Rect;
            return child.getAttr('height');
        }

        return '-';
    }

    public deselectTemplate() {
        console.log('deselecting...');
        let children = this.uiGroup.getChildren();
        if (children.length > 0) {
            let child = children[0] as Rect;
            child.setAttr('stroke', 'black');
            child.setAttr('strokeWidth', '1');
            child.dash([]);
        }

    }

    public showConnectors() {
        console.log('nothing..');
    }

    public hideConnectors() {
        console.log('nothing..');
    }

    public getConnectors(): Connectors {
        return this.connectors;
    }

    public getConnectorPosition(connectorType: ConnectorType) : {x: number, y: number} {
        let connector: RegularPolygon = null;
        let x: number = 0;
        let y: number = 0;

        switch(connectorType) {
            case ConnectorType.TOP:
                connector = this.connectors.topConnector;
                break;
            case ConnectorType.BOTTOM:
                connector = this.connectors.bottomConnector;
                break;
            case ConnectorType.LEFT:
                connector = this.connectors.leftConnector;
                x = this.getX();
                y = this.getY() + connector.getAttr('y') + 40;
                break;
            case ConnectorType.RIGHT:
                connector = this.connectors.rightConnector;
                x = this.getX() + this.getWidth();
                y = this.getY() + connector.getAttr('y') + 40;
                break;
        }


        return {x:x, y: y};
    }
}

export interface TemplateEventsCallback {
    templateClicked(template);
    drawArrow(connector);
    drawConnections();
}

export class TemplateGroup {
    public group: Group = new Group({
        draggable: true
    });
    public rect: Rect;
    public identifer: string;

    constructor() {
        this.identifer = Guid.newGuid().toString();
    }

    private templates: Template[] = new Array<Template>();

    public createGroup(x, y, width, height) {
        this.group = new Group({
            x: x, 
            y: y,
            width: width, 
            height: height,
            draggable: true
        });

        this.rect = new Rect({
            x : 0,
            y : 0,
            width : width,
            height : height
        });
        
        this.group.on('click', (event) => {
            
        });

        this.group.add(this.rect);
    }

    public getTemplates(): Template[] {
        return this.templates;
    }

    public select() {
        // this.rect.setAttr('stroke', '#006bb3');
        // this.rect.setAttr('strokeWidth', '5');
        // this.rect.dash([10, 5]);

        for (var index = 0; index < this.templates.length; index++) {
            this.templates[index].select();
        }
    }

    public deleteGroup() {
        for (var index = 0; index < this.templates.length; index++) {
            this.templates[index].uiGroup.remove();
        }
    }

    public deselect() {
        // this.rect.setAttr('stroke', 'black');
        // this.rect.setAttr('strokeWidth', '1');
        // this.rect.dash([]);

        for (var index = 0; index < this.templates.length; index++) {
            this.templates[index].deselectTemplate();
        }
    }

    public showConnections() {
        for (let index = 0; index < this.templates.length; index++) {
            let template = this.templates[index];            
        }
    }

    public addTemplate(template:Template, deleteOriginal:boolean = true) {
        
        var newTemplate = template.cloneWithoutId();
        newTemplate.createUI(template.getX(), template.getY(), false);

        if(deleteOriginal == true) {
            template.uiGroup.remove();
        }

        this.group.add(newTemplate.uiGroup);        
        this.templates.push(newTemplate);

        return newTemplate;
    }

    public addTemplates(templates:Template[]) {
        var y = 0;
        for (var index = 0; index < templates.length; index++ ){
            var template = templates[index];
            // template.changeOrigin(0, y * index);
            this.templates.push(template);
            //template.uiGroup.setAttr('draggable', false);
            this.group.add(template.uiGroup);
            y +=  template.getHeight() + 5;
        }
    }

    public contains(id) {
        for (var index = 0; index < this.templates.length; index++) {
            if (this.templates[index].identifier == id) {
                return true;
            }
        }

        return false;
    }

    public ungroup() {
        // this.group.remove();
        // this.group.removeChildren();
        this.deselect();
    }
}
