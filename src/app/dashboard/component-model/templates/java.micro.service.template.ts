import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class JavaMicroServiceTemplate extends GenericMicroServiceTemplate {

    public constructor(callback) {
        super(callback)
        this.name = 'Java Micro Service';
        this.type = 'JavaMicroServiceTemplate';
    }

    public getType(): String {
        return 'Java Micro Service Template';
    }

    public clone() {
        let obj = new JavaMicroServiceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        return obj;
    }

    public getHeaderColor(): String {
        return 'lightblue';
    }
}