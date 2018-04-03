/**
 * Input introduced to an Interface from a load variable or/and from
 * another interface of the same or another component.
*/
export class CptLoad {
    public loadValues: { [k: string]: number } = {};

    constructor() {

    }

    public multiply(factor: number): CptLoad {
        let o = new CptLoad();
        if (this.loadValues.hasOwnProperty("tps")) {
            o.loadValues["tps"] = this.loadValues["tps"] * factor;
        }
        return o;
    }
    
    /*
    public add(l: CptLoad, factor?: number): CptLoad {
        let o = new CptLoad();
        if (this.loadValues.hasOwnProperty("tps") && l.loadValues.hasOwnProperty("tps")) {
            o.loadValues["tps"] = this.loadValues["tps"] + (l.loadValues["tps"]);
        }
        return o;
    }*/

    //more generic version of adding loads together
    public addLoad(l: CptLoad, factor?: number): CptLoad {
        let o = new CptLoad();
        console.log("load", this.loadValues);
        console.log(l.loadValues);
        for (let key in l.loadValues){
            console.log("looking at " +key);
            if (this.loadValues.hasOwnProperty(key) && l.loadValues.hasOwnProperty(key)) {
                o.loadValues[key] = this.loadValues[key] + (l.loadValues[key]);
            }    
           
        }    
        for (let key in this.loadValues){
            if (!l.loadValues.hasOwnProperty(key)){
                o.loadValues[key] = this.loadValues[key];
            }
        }
        return o;
    }

}