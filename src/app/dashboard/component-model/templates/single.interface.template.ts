import { ComponentTemplate } from "./component.template";

export class SingleInterfaceTemplate extends ComponentTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Single Interface';
        this.type = 'SingleInterfaceTemplate';
    }

    public getType(): String {
        return 'Single Inheritance Template';
    }

    public clone() {
        let obj = new SingleInterfaceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightyellow';
    }
}