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

    public add(l: CptLoad, factor?: number): CptLoad {
        let o = new CptLoad();
        if (this.loadValues.hasOwnProperty("tps") && l.loadValues.hasOwnProperty("tps")) {
            o.loadValues["tps"] = this.loadValues["tps"] + (l.loadValues["tps"]);
        }
        return o;
    }

}