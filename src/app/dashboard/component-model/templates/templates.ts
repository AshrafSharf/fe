import { Guid } from '../../../shared/guid';
import { Group, Rect, RegularPolygon, Arrow } from 'konva';

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
    public inputComponentName: string;
    public inputInterfaceName: string;
    public inputModelInterfaceId: string;
    public outputComponentName: string;
    public outputInterfaceName: string;
    public outputModelInterfaceId: string;
    public arrow: Arrow;
    public visualProperties: ConnectionVisualProperties;
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
    protected callback: TemplateEventsCallback;
    public uiGroup:Group = null;
    public connectors:Connectors = new Connectors();

    constructor (callback) {
        this.callback = callback;
        this.identifier = Guid.newGuid().toString();
    }

    public abstract createUI(x, y): any;
    public abstract getType(): String;
    public abstract getHeaderColor(): String;

    public reloadUI() {

        let x = this.uiGroup.x();
        let y = this.uiGroup.y();

        // remove the older contents
        this.uiGroup.remove;

        // rebuild the ui
        return this.createUI(x, y);
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
