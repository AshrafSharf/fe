import { ModelProperty } from "./model-property";
import { ModelInterface } from "./model-interface";

export interface ModelComponent{
    id:string;
    modelId:string;
    title:string;
    displayName:string;
    order:number;
    templateName:string;
    modelComponentPropertiesList:ModelProperty[];
    modelComponentInterfaceList:ModelInterface[];
}