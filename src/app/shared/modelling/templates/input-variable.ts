import { CptComponent } from "../cpt-component";
import { CptInterface } from "../cpt-interface";
import { CptHook } from "../cpt-object";
import { CptStats } from "../cpt-stats";
import { CptOutput } from '../cpt-output';



export class InputVariableInterface extends CptInterface {
    
    public componentId:string;
    public inputLoad:number;
    public tps:number;

    constructor(obj?: InputVariableInterface) {
        super(obj);
        //this.load.loadValues["tps"] = this.tps;
    }
    public getClassId() {
        return InputVariableInterface.name;
    }

    public getOutput() {
        let o = new CptOutput();
      /*  for (let key in this.load.loadValues ){
            o.addVal(key, this.load.loadValues[key]);
       }*/
       o.addVal("inputLoad", this.inputLoad);
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