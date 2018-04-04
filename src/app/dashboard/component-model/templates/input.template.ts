import { GenericMicroServiceTemplate } from "./generic.micro.service.template";
import { TemplateInterface } from "./templates";

export class InputTemplate extends GenericMicroServiceTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Input Template';
        this.type = 'InputTemplate';
    }

    public getType(): String {
        return 'Input Template';
    }

    public canAddInterface() {
        return false;
    }

    public clone() {
        let obj = new InputTemplate(this.callback);
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