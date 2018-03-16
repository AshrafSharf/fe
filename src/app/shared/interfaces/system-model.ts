import { ModelComponent } from "./model-component";
import { ModelVariable } from "./model-variable";

export interface SystemModel{
    id: string;
    modelBranchId: string;
    modelComponentList:ModelComponent[];
    modelVariableInputList:ModelVariable[];
    modelVersion: string;   
}