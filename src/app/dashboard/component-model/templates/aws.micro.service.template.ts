import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class AwsMicroServiceTemplate extends GenericMicroServiceTemplate{
    public volumePerPod:number = 0;
    public numPods:number = 0;

    public constructor(callback) {
        super(callback);
        this.name = 'AWS Micro Service';
        this.type = 'AwsMicroServiceTemplate';
    }

    public getHeaderColor(): String {
        return 'red';
    }

    public getType(): String {
        return this.type;
    }

    public clone() {
        let obj = new AwsMicroServiceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.interfaces = this.interfaces;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        obj.connectors = this.connectors;
        return obj;
    }

}