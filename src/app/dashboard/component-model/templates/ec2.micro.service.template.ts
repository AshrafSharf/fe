import { GenericMicroServiceTemplate } from "./generic.micro.service.template";

export class Ec2MicroServiceTemplate extends GenericMicroServiceTemplate{
   //default instance type
    public instanceType = "t2.small";

    public constructor(callback) {
        super(callback);
        this.name = 'EC2 Micro Service';
        this.type = 'Ec2MicroServiceTemplate';
    }

    public getHeaderColor(): String {
        return 'lightcoral';
    }

    public getType(): String {
        return this.type;
    }

    public clone() {
        let obj = new Ec2MicroServiceTemplate(this.callback);
        obj.identifier = this.identifier;
        obj.name = this.name;
        obj.instanceType = this.instanceType;
        obj.interfaces = this.interfaces;
        obj.modelComponentPropertiesList = this.modelComponentPropertiesList;
        obj.fixedProperties = this.fixedProperties;
        obj.connectors = this.connectors;
        return obj;
    }

}