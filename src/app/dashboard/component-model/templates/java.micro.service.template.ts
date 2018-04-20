import { ComponentTemplate } from "./component.template";

export class JavaMicroServiceTemplate extends ComponentTemplate {
    //default instance type
    public instanceType = "none";

    public constructor(callback) {
        super(callback)
        this.name = 'Java Micro Service';
        this.type = 'JavaMicroServiceTemplate';
    }

    public getType(): String {
        return 'JavaMicroServiceTemplate';
    }

    public clone() {
        let obj = new JavaMicroServiceTemplate(this.callback);
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
