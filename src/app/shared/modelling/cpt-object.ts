/**
 * Generic representation of objects which make up a system model.
 * (e.g. Components, Interfaces, etc)
*/
export abstract class CptObject {

    public displayName: string;
    public id: string;
    public classId: string;

    constructor(obj?: CptObject) {
        if (obj) {
            this.id = obj.id;
            this.displayName = obj.displayName;
            this.classId = obj.classId;
        } else {
            this.id = this.generateId();
            this.classId = this.getClassId();
        }
    }

    public setName(n: string) {
        this.displayName = n;
    }
    protected generateId(): string {
        return Math.random().toString(36).substr(2, 16);
    }

    public abstract getClassId(): string;

    public toJSON(): { [k: string]: any } {
        return {
            displayName: this.displayName,
            id: this.id,
            classId: this.classId
        };
    }

    public getSubObject(objId: string): CptObject {
        return objId === this.id ? this : null;
    }

    protected findObject(objs: CptObject[], objId: string): CptObject {
        for (let i = 0; i < objs.length; ++i) {
            if (objs[i].id === objId)
                return objs[i];
        }
        return null;
    }
}

export function CptHook(...params: string[]) {
    return (target: any, hookId: string) => {
        let hookObj = target as CptHookableObject;
        hookObj._registerHook(hookId);
        if (params !== null && params.length > 0) {
            hookObj._registerHookParams(hookId, params);
        }
    }
}


export abstract class CptHookableObject extends CptObject {

    public hooks: { [hookId: string]: string } = {};
    public static availableHooks: { [hookId: string]: string } = {};
    public static availableHooksParams: { [hookId: string]: string[] } = {};

    public toJSON(): { [k: string]: any } {
        let o = super.toJSON();
        o.hooks = this.hooks;
        return o;
    }


    constructor(obj?: CptHookableObject) {
        super(obj);
        if (obj) {
            Object.assign(this, obj);
        }
    }

    public _registerHook(hookId: string) {
        CptHookableObject.availableHooks[hookId] = null;
    }

    public _registerHookParams(hookId: string, params: string[]) {
        CptHookableObject.availableHooksParams[hookId] = params;
    }

    public addHookCode(hookId: string, code: string) {
        if (CptHookableObject.availableHooks.hasOwnProperty(hookId)) {
            this.hooks[hookId] = code;

        }
    }

    public listHooks(): string[] {
        let hookIds: string[] = [];
        for (let hookId in CptHookableObject.availableHooks)
            hookIds.push(hookId);
        return hookIds;
    }

    protected populateHooks() {
        for (let hookId in CptHookableObject.availableHooks) {

            if (this.hooks.hasOwnProperty(hookId)) {
                let params: string[] = [];
                if (CptHookableObject.availableHooksParams.hasOwnProperty(hookId)) {
                    params = CptHookableObject.availableHooksParams[hookId];
                }
                this[hookId] = new Function(...params, this.hooks[hookId]);
            }
        }
    }

}