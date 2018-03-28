import { CptComponent } from "../cpt-component";
import { CptInterface } from "../cpt-interface";
import { CptHook } from "../cpt-object";
import { CptStats } from "../cpt-stats";
import { CptOutput } from '../cpt-output';



export class InputVariableInterface extends CptInterface {
    public tps: number = 0;
    public latency: number = 0;
    public componentId:string;


    constructor(obj?: InputVariableInterface) {
        super(obj);
        this.load.loadValues["tps"] = this.tps;
    }
    public getClassId() {
        return InputVariableInterface.name;
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
        o.addVal("lat", this.latency);
        return o;
    }

    @CptHook("load", "latency")
    public adjustLatencyToLoad?: Function;

}


export class InputVariable extends CptComponent {
    public ifs: InputVariableInterface[] = [];
    constructor(obj?: InputVariable) {
        super(obj);

    }

    public addInterface(name: string): InputVariableInterface {
        let newInterface = new InputVariableInterface();
        newInterface.setName(name);
        this.ifs.push(newInterface);
        console.log("CptMicroserviceInterface " + newInterface.displayName + " added to " + this.displayName);
        return newInterface;
    }

    public getClassId() {
        return InputVariable.name;
    }

    public getInterfaces(): InputVariableInterface[]{
        return this.ifs;
    }

}