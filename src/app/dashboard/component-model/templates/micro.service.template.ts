import { ComponentTemplate } from "./component.template";

export class MicroServiceTemplate extends ComponentTemplate {
    //default instance type
    public instanceType = "none";

    public constructor(callback) {
        super(callback)
        this.name = ' Micro Service';
        this.type = 'MicroServiceTemplate';
    }

    public getType(): String {
        return 'MicroServiceTemplate';
    }

    public clone() {
        let obj = new MicroServiceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        obj.instanceType = this.instanceType;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        obj.fixedProperties = this.fixedProperties;
        obj.connectors = this.connectors;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightblue';
    }
}
