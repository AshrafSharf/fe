import { CptComponent } from "./cpt-component";
import { CptObject } from './cpt-object';
import { CptInterface } from './cpt-interface';
import { CptLoad } from './cpt-load';
import { CptOutput } from './cpt-output';





/**
 * Where components and interfaces are registered
*/
export class CptEnvironment {

    /**
     * data structure where registered cpt objects are stored
     */
    public envComponents: CptComponent[] = [];

    /**
     * The names of all input variables in the environment
     */
    public envInputVariableNames: String[] = [];

     public envInputVariables: Map<String, number > = new Map<String, number>();

    public constructor(obj?: CptEnvironment) {
        if (obj) {
            Object.assign(this, obj);
            // for (let i = 0; i < this.envObjects.length; ++i) {
            // this.envObjects[i] = new CptObject(this.envObjects[i]);
            // }
        }
    }

    public static inst: CptEnvironment = new CptEnvironment();
    public static get(): CptEnvironment {
        return CptEnvironment.inst;
    }

    /**
     *
     * @param id The id of the requested cpt oject
     * @returns The cpt object with the specified id
     */
    public getObject(id: string): CptObject {
        for (let index = 0; index < this.envComponents.length; index++) {
            if (this.envComponents[index].id == id) {
                return this.envComponents[index];
            }
        }
        for (let index = 0; index < this.envComponents.length; index++) {
            let c = this.envComponents[index];
            let o = c.getSubObject(id);
            if (o !== null)
                return o;
        }
        return null;
    }

    /**
     *
     * @param id The id of the requested interface
     * @returns The interface object with the specified id
     */
    public getInterface(id: string): CptInterface {
        return this.getObject(id) as CptInterface;
    }

    /**
     *
     * @param id The id of the requested component
     * @returns The compoment object with the specified id
     */
    public getComponent(id: string): CptComponent {
        return this.getObject(id) as CptComponent;
    }

    /**
     *
     * @param comp the component object to register to the environment
     */
    public registerComponent(comp: CptComponent) {
        this.envComponents.push(comp);
    }

    public setInputVariables(name:String, value:String){
        let valueNum = Number(value);
        this.envInputVariables.set(name,valueNum);
    }

    private getCompByTop(nr: number): CptComponent {
        for (var i = 0; i < this.envComponents.length; ++i) {
            let c = this.envComponents[i];
            if (c.order === nr)
                return c;
        }
        return null;
    }

    private inTopologicalOrder(cb: (c: CptComponent) => void) {
        for (var i = 0; i < this.envComponents.length; ++i) {
            let c = this.getCompByTop(i);
            if (c) {
                cb(c);
            }
        }
    }

    private inInvTopologicalOrder(cb: (c: CptComponent) => void) {
        for (var i = this.envComponents.length; i >= 0; i--) {
            let c = this.getCompByTop(i);
            if (c) {
                cb(c);
            }
        }
    }

    public getLoad(inputVariable: string): CptLoad {
     //   if (loadVariable === "A") {
            let l = new CptLoad();
            console.log("varName", inputVariable);
            console.log(this.envInputVariables);
            l.loadValues["tps"] = this.envInputVariables.get(inputVariable);
            console.log(l);
            return l;
           
      //  }
        
    }

    public runSim() {
        this.inTopologicalOrder(c => c.simulationInit());

        this.inTopologicalOrder(c => c.simulationRun());

        this.inInvTopologicalOrder(c => c.simulationStop());

        this.inTopologicalOrder(c => c.simulationPostProcess());

        let o = new CptOutput();
        this.inTopologicalOrder(c => o.addSub(c.displayName, c.getOutput()));
        return o;
    }

}