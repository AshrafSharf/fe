export class CptInputVariable {
    public tps: number;
    constructor(obj?: CptInputVariable) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
    getTps() {
        return this.tps;
    }

    setTps(tps: number) {
        this.tps = tps;
    }
}