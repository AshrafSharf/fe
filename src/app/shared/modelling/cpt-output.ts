import { CptObject } from './cpt-object';


export class CptOutput {
    public val: { [k: string]: number } = {};
    public sub: { [k: string]: CptOutput } = {};

    public addVal(key: string, value: number) {
        this.val[key] = value;

    }
    public addSub(key: string, output: CptOutput) {
        this.sub[key] = output;
    }

    public getVal(){
        return this.val;
    }

    public getSub(){
        return this.sub;
    }
}