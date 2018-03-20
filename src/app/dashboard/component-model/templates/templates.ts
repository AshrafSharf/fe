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

<<<<<<< HEAD
    public abstract createUI(isDraggable?:boolean): any;
=======
    public abstract createUI(x, y): any;
>>>>>>> d78b833105cb79a19e3649b99a80cfd02e2dfca6
    public abstract reloadUI(): any;
    public abstract getType(): String;
    public abstract getHeaderColor(): String;
}

export interface TemplateEventsCallback {
    templateClicked(template);
}