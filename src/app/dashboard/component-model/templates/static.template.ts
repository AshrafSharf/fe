import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class StaticTemplate extends GenericMicroServiceTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Static Template';
    }

    public getType(): String {
        return 'Static Template';
    }

    public clone() {
        let obj = new StaticTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightgreen';
    }
}