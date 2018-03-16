export class CptStats {
    public val: { [k: string]: number } = {};

    public multiply(factor: number): CptStats {
        let o = new CptStats();
        if (this.val.hasOwnProperty("lat")) {
            o.val["lat"] = this.val["lat"] * factor;
        }
        return o;
    }
}