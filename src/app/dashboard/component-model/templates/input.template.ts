import { TemplateInterface } from "./templates";
import { ComponentTemplate } from "./component.template";

export class InputTemplate extends ComponentTemplate{

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
        obj.fixedProperties = this.fixedProperties;
        return obj;
    }

    public getTitle():string {
        for (var index = 0; index < this.fixedProperties.length; index++) {
            let prop = this.fixedProperties[index];
            if (prop.name == 'Display Name') {
                if (prop.value.length > 0) {
                    return prop.value.toString();
                } else {
                    break;
                }
            }
        }
        return this.name.toString();
    }
    
    public getHeaderColor(): String {
        return 'lightgreen';
    }
}