import {ComponentTemplate } from "./component.template";

export class StaticTemplate extends ComponentTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Static Template';
        this.type = 'StaticTemplate';
    }

    public getType(): String {
        return 'Static Template';
    }

    public clone() {
        let obj = new StaticTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightgreen';
    }
}