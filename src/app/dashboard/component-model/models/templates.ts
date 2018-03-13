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
    public identifier:String = '';
    public name:String = '';
    public interfaces:TemplateInterface[] = Array<TemplateInterface>();
    protected callback: TemplateEventsCallback;
    public uiGroup:Group = null;

    constructor (callback) {
        this.callback = callback;
        this.identifier = Guid.newGuid().toString();
    }

    public abstract createUI(): any;
    public abstract reloadUI(): any;
}

export interface TemplateEventsCallback {
    templateClicked(template);
}