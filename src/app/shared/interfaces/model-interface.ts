import { ModelProperty } from "./model-property";
import { ModelVariable } from "./model-variable";
import {ModelInterfaceEndpoint} from "./model-interface-endpoint";

export interface ModelInterface{
    id: string;
    title:string;
    modelInputVariableList:ModelVariable[];
    modelInterfaceEndPointsList:ModelInterfaceEndpoint[];
    modelInterfacePropertiesList: ModelProperty[];
          
      
}