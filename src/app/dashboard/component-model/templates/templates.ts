import { Guid } from '../../../shared/guid';
import { Group } from 'konva';

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
    public interfaces: TemplateInterface[] = Array<TemplateInterface>();
    protected callback: TemplateEventsCallback;
    public uiGroup:Group = null;

    constructor (callback) {
        this.callback = callback;
        this.identifier = Guid.newGuid().toString();
    }
    
    public abstract createUI( x, y, isDraggable?:boolean): any;
    public abstract reloadUI(): any;
    public abstract getType(): String;
    public abstract getHeaderColor(): String;
    public abstract getX();
    public abstract getY();
    public abstract getWidth();
    public abstract getHeight();
    public abstract deselectTemplate();
}

export interface TemplateEventsCallback {
    templateClicked(template);
}