import { TemplateInterfaceProperty } from "../../dashboard/component-model/templates/templates";

export interface ComponentModelInterfaceEndPointProperty {

}

export interface ComponentModelInterfaceVisualProperties {
    color: String;
    height: String;
    id: String;
    shape: String;
    width: String;
    xPosition: String;
    yPosition: String;
}

export interface ComponentModelInterfaceProperty {
  //  id: String;
    key: String;
    value: String;
}

export interface ComponentModelInterfaceEndPoint {
    id: String;
    inputModelInterfaceId: String;
    outputModelInterfaceId: String;
    inputInterfaceName:String;
    outputInterfaceName:String;
    inputComponentName: String;
    outputComponentName: String;
    outputProperties:ComponentModelInterfaceProperty[];
}

export interface ComponentModelInterface {
    id: String;
    title: String;
    latency: String;
    modelInputVariableList;
    modelInterfaceEndPointPropertiesList: Array<ComponentModelInterfaceEndPointProperty>;
    modelInterfaceEndPointsList: Array<ComponentModelInterfaceEndPoint>;
    modelInterfacePropertiesList: Array<ComponentModelInterfaceProperty>;
}

export interface ComponentModelComponent {
    id: String;
    title: String;
    displayName:String;
    modelId: String;
    order: String;
    instanceType:string;
    templateName: String;
    fixedProperties;
    modelComponentInterfaceList: Array<ComponentModelInterface>;
    modelComponentPropertiesList;
    modelComponentVisualProperties: ComponentModelInterfaceVisualProperties;
}

export interface ComponentModel {
    id: String;
    title: String;
    description: String;
    ownerName: String;
    ownerId: String;
    labelList;
    shapesList:Array<ComponentModelComponent>;
    modelComponentList:Array<ComponentModelComponent>;
    modelInterfaceEndPointsList:Array<ComponentModelInterfaceEndPoint>;
    fixedProperties: Array<ComponentModelInterfaceProperty>;
}