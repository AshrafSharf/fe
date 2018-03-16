import { CptObject, CptHookableObject } from './cpt-object';
import { CptLoad } from './cpt-load';
import { CptEnvironment } from './cpt-environment';
import { CptSimulationLifecylce } from './cpt-simulation-lifecycle';
import { CptOutput } from './cpt-output';
import { CptStats } from './cpt-stats';


/**
 * Handles the output operations of an Interface
*/
export class CptInterfaceOutput extends CptObject {
    public multiplier: number = 1;
    public downstreamInterfaceId: string;

    constructor(obj?: CptInterfaceOutput) {
        super(obj);
        if (obj) {
            Object.assign(this, obj);
        }
    }

    public getClassId() {
        return CptInterfaceOutput.name;
    }

    /**
     *
     * @param l the load to be sent to the Downstream Interface.
     */
    sendLoad(l: CptLoad) {
        let target = CptEnvironment.get().getInterface(this.downstreamInterfaceId);
        if (target !== null)
            target.receiveLoad(l.multiply(this.multiplier));

    }

    public getDownstreamStats(): CptStats {
        let target = CptEnvironment.get().getInterface(this.downstreamInterfaceId);
        if (target !== null) {
            return target.getStats().multiply(this.multiplier);
        }
        return null;
    }

    /**
     * Sets the Downstream Interface
     * @param interf the Interface to connect to
     */
    public connect(interf: CptInterface) {
        this.downstreamInterfaceId = interf.id;
    }
}

/**
 * Part of a component. Can have an input at which
 * it receives a load and multiple outputs at which it
 * sends the load on to downstream components/interfaces.
*/
export class CptInterface extends CptHookableObject implements CptSimulationLifecylce {

    public inputLoadVariable?: string;
    public outputs: CptInterfaceOutput[] = [];

    public load: CptLoad = new CptLoad();
    constructor(obj?: CptInterface) {
        super(obj);
        if (obj) {
            Object.assign(this, obj);
        }
    }

    public getClassId() {
        return CptInterface.name;
    }


    public toJSON(): { [k: string]: any } {
        let o = super.toJSON();
        o.outputs = this.outputs;
        if (this.inputLoadVariable)
            o.inputLoadVariable = this.inputLoadVariable;
        return o;
    }

    /**
     * Adds a new output to an Interface
     * @returns the newly created Interface Output
    */
    public addOutput(): CptInterfaceOutput {
        let o = new CptInterfaceOutput();
        this.outputs.push(o);
        return o;
    }

    /**
     * Merges/recieves load from incoming connections
     * @param l the load to be recieved
     */
    public receiveLoad(l: CptLoad) {
        this.load = this.load.add(l);
    }

    /**
     * Sends the load of an Interface to each of its outputs
    */
    protected sendLoadToOutputs(l: CptLoad) {
        for (let index = 0; index < this.outputs.length; index++) {
            let output = this.outputs[index];
            output.sendLoad(l);
        }
    }

    protected collectDownstreamStats(): CptStats[] {
        let o: CptStats[] = [];
        for (let index = 0; index < this.outputs.length; index++) {
            let output = this.outputs[index];
            let s = output.getDownstreamStats();
            if (s)
                o.push(s);
        }
        return o;
    }

    public getStats(): CptStats {
        return null;
    }

    public getSubObject(objId: string): CptObject {
        let o = super.getSubObject(objId);
        return o !== null ? o : this.findObject(this.outputs, objId);
    }

    /** Implement Simulation Lifecycle */

    public simulationInit() {
        console.log("simulationInit ", this.displayName);
        this.populateHooks();
        if (this.inputLoadVariable) {
            this.load = CptEnvironment.get().getLoad(this.inputLoadVariable);
        }

    }
    public simulationRun() {
        console.log("simulationRun ", this.displayName);
        if (this.load)
            this.sendLoadToOutputs(this.load);

    }
    public simulationStop() {
        console.log("simulationStop ", this.displayName);

    }
    public simulationPostProcess() {

    }

    public getOutput(): CptOutput {
        let o = new CptOutput();

        return o;
    }




}