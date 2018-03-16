import { CptEnvironment } from "./cpt-environment";
import { CptObject, CptHookableObject, CptHook } from './cpt-object';
import { CptInterface } from './cpt-interface';
import { CptOutput } from './cpt-output';
import { CptSimulationLifecylce } from './cpt-simulation-lifecycle';


function ComponentHook2(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
    return (target, propertyKey: string, descriptor: PropertyDescriptor): void => {

    };
}


function ComponentHook(target, propertyKey: string, descriptor: PropertyDescriptor): void {

}



/**
 * A part of the system model which holds interfaces.
*/
export class CptComponent extends CptHookableObject implements CptSimulationLifecylce {
    protected ifs: CptInterface[] = [];
    public order: number = 0;


    public toJSON(): { [k: string]: any } {
        let o = super.toJSON();
        o.ifs = this.ifs;
        return o;
    }

    public getClassId() {
        return CptComponent.name;
    }

    constructor(obj?: CptComponent) {
        super(obj);
        if (obj) {
            Object.assign(this, obj);
            for (let i = 0; i < this.ifs.length; ++i) {
                this.ifs[i] = new CptInterface(this.ifs[i]);
            }
        }
    }

    /**
     * Adds a new Interface to a Component.
     * @param name The name to be given to the newly created Interface
     * @returns THe newly created Interface
     */
    public addInterface(name: string): CptInterface {
        let newInterface = new CptInterface();
        newInterface.setName(name);
        this.ifs.push(newInterface);
        console.log("Generic interface " + newInterface.displayName + " added to " + this.displayName);
        return newInterface;
    }

    public getInterfaces(){
        return this.ifs;
    }

    public getSubObject(objId: string): CptObject {
        let o = super.getSubObject(objId);
        return o !== null ? o : this.findObject(this.ifs, objId);
    }



    /** Implement Simulation Lifecycle */

    public simulationInit() {
        this.populateHooks();
        for (let ifNr in this.ifs) {
            this.ifs[ifNr].simulationInit();
        }

    }
    public simulationRun() {
        for (let ifNr in this.ifs) {
            this.ifs[ifNr].simulationRun();
        }

    }
    public simulationStop() {
        for (let ifNr in this.ifs) {
            this.ifs[ifNr].simulationStop();
        }

    }
    public simulationPostProcess() {
        for (let ifNr in this.ifs) {
            this.ifs[ifNr].simulationPostProcess();
        }
    }

    public getOutput(): CptOutput {
        let o = new CptOutput();
        for (let ifNr in this.ifs) {
            let interf = this.ifs[ifNr];
            o.addSub(interf.displayName, interf.getOutput());
        }
        if (this.modifyOutput)
            this.modifyOutput(o);
        return o;
    }

    /** Hooks */
    @CptHook("output")
    public modifyOutput?: Function;


}