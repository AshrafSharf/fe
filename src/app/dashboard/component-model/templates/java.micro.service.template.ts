import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class JavaMicroServiceTemplate extends GenericMicroServiceTemplate {

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
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        obj.connectors = this.connectors;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightblue';
    }
}
