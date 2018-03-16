import { CptMicroserviceComponent, CptMicroserviceInterface } from "./cpt-microservice";
import { CptHook } from '../cpt-object';
import { CptLoad } from '../cpt-load';


export class CptJavaMicroserviceInterface extends CptMicroserviceInterface {
    constructor(obj?: CptJavaMicroserviceInterface) {
        super(obj);
    }

    public latency: number = 0;

    public getClassId() {
        return CptJavaMicroserviceInterface.name;
    }

    receiveLoad(l: CptLoad) {
        if (this.tweakLoad)
            this.tweakLoad(l);
        super.receiveLoad(l);
    }

    @CptHook("load")
    public tweakLoad?: Function;
}


export class CptJavaMicroserviceComponent extends CptMicroserviceComponent {
    public ifs: CptJavaMicroserviceInterface[] = [];
    public maxTPS: number;
    constructor(obj?: CptJavaMicroserviceComponent) {
        super(obj);
    }
    public getClassId() {
        return CptJavaMicroserviceComponent.name;
    }

    getMaxTPS() {
        return this.maxTPS;
    }

    setMaxTPS(tps: number) {
        this.maxTPS = tps;
        if (this.adjustTps) {
            this.maxTPS = this.adjustTps(this.maxTPS);
        }
    }

    public addInterface(name: string): CptJavaMicroserviceInterface {
        let newInterface = new CptJavaMicroserviceInterface();
        newInterface.setName(name);
        this.ifs.push(newInterface);
        console.log("CptJavaMicroserviceInterface " + newInterface.displayName + " added to " + this.displayName);
        return newInterface;
    }

    @CptHook("tps")
    public adjustTps?: Function;
}