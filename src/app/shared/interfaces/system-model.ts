import { ModelComponent } from "./model-component";
import { ModelVariable } from "./model-variable";
import { ModelInterfaceEndpoint } from "./model-interface-endpoint";

export interface SystemModel{
    id: string;
    title:string;
    modelBranchId: string;
    modelComponentList:ModelComponent[];
    modelVariableInputList:ModelVariable[];
    modelInterfaceEndPointsList: ModelInterfaceEndpoint[];
    modelVersion: string;   
}