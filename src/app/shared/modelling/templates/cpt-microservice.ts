import { CptComponent } from "../cpt-component";
import { CptInterface } from "../cpt-interface";
import { CptHook } from "../cpt-object";
import { CptStats } from "../cpt-stats";
import { CptOutput } from '../cpt-output';



export class CptMicroserviceInterface extends CptInterface {
    public tps: number = 0;
    public latency: number = 0;
    public properties: { [k: string]: number } = {};
  
    public 

    constructor(obj?: CptMicroserviceInterface) {
        super(obj);
        for (let key in this.properties){
            console.log("key", key);
            this.load.loadValues[key] = this.properties[key];
        }
        this.load.loadValues["tps"] = this.tps;
    }

    addProperty(key, value){
        this.properties[key] = value;
        console.log(this.properties);
        this.load.loadValues[key] = this.properties[key];
        console.log(this.load);
    }
    public getClassId() {
        return CptMicroserviceInterface.name;
    }

    public getStats(): CptStats {
        let s = new CptStats();
        s.val["lat"] = this.latency;
        return s;
    }

    public simulationStop() {
        if (this.adjustLatencyToLoad) {
            this.latency = this.adjustLatencyToLoad(this.load, this.latency);
        }
        let stats = this.collectDownstreamStats();
        for (var i = 0; i < stats.length; ++i) {
            let s = stats[i];
            if (s.val.hasOwnProperty("lat")) {
                this.latency += s.val.lat;
            }
        }
        console.log("latency on " + this.displayName, ":", this.latency);

    }

    public getOutput() {
        let o = new CptOutput();
        o.addVal("tps", this.load.loadValues["tps"]);
       for (let key in this.load.loadValues ){
            o.addVal(key, this.load.loadValues[key]);
       }
        o.addVal("lat", this.latency);
        return o;
    }

    @CptHook("load", "latency")
    public adjustLatencyToLoad?: Function;


}


export class CptMicroserviceComponent extends CptComponent {
    public ifs: CptMicroserviceInterface[] = [];
    constructor(obj?: CptMicroserviceComponent) {
        super(obj);

    }

    public addInterface(name: string): CptMicroserviceInterface {
        let newInterface = new CptMicroserviceInterface();
        newInterface.setName(name);
        this.ifs.push(newInterface);
        console.log("CptMicroserviceInterface " + newInterface.displayName + " added to " + this.displayName);
        return newInterface;
    }

    public getClassId() {
        return CptMicroserviceComponent.name;
    }

    public getInterfaces(): CptMicroserviceInterface[]{
        return this.ifs;
    }

}