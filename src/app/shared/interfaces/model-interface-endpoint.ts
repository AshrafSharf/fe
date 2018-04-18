import { ModelProperty } from "./model-property";

export interface ModelInterfaceEndpoint{
    id:string;
    inputModelInterfaceId:string;
    outputModelInterfaceId:string;
    inputModelComponentName: string;
    outputModelComponentName: string;
    inputModelInterfaceName: string;
    outputModelInterfaceName: string;
    endpointProperties:ModelProperty[];
    modelId: string;
}