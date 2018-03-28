import { Guid } from '../../../shared/guid';
import { Group, Rect } from 'konva';

export interface TemplateInterfaceProperty {
    name:String;
    value: String;
}

export interface DownstreamInterface {
    component:String;
    connectedInterface:String;
}

export class TemplateInterface {
    public name:String = '';
    public latency: String = '';
    
    public properties: TemplateInterfaceProperty[] = new Array<TemplateInterfaceProperty>();
    public downstreamInterfaces: DownstreamInterface[] = new Array<DownstreamInterface>();
}

export abstract class Template {
    public identifier: String = '';
    public name: String = '';
    public type: String  = '';
    public modelComponentPropertiesList: TemplateInterfaceProperty[] = new Array<TemplateInterfaceProperty>();
    public interfaces: TemplateInterface[] = Array<TemplateInterface>();
    protected callback: TemplateEventsCallback;
    public uiGroup:Group = null;

    constructor (callback) {
        this.callback = callback;
        this.identifier = Guid.newGuid().toString();
    }

    public abstract createUI( x, y, isDraggable?:boolean): any;
  //  public abstract createUI(x, y): any;
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
}

export interface TemplateEventsCallback {
    templateClicked(template);
}