import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class SingleInterfaceTemplate extends GenericMicroServiceTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Single Interface';
    }

    public getType(): String {
        return 'Single Inheritance Template';
    }

    public clone() {
        let obj = new SingleInterfaceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightyellow';
    }
}