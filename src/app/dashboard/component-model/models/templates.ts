
export interface TemplateInterfaceProperty {
    name:String;
    value: String;
}

export interface DownstreamInterface {
    component:String;
    connectedInterface:String;
}

export class TemplateInterface {
    public properties: TemplateInterfaceProperty[] = new Array<TemplateInterfaceProperty>();
    public downstreamInterfaces: DownstreamInterface[] = new Array<DownstreamInterface>();
}

export class Template {
    public name:String = '';
    public interfaces:TemplateInterface[] = Array<TemplateInterface>();
}

export class GenericMicroServiceTemplate extends Template {
    
    public createUI() {

    }
}