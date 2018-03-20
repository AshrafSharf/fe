
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
    id: String;
    key: String;
    value: String;
}

export interface ComponentModelInterfaceEndPoint {
    id: String;
    inputModelInterfaceId: String;
    outputModelInterfaceId: String;
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
    modelId: String;
    order: String;
    templateName: String;
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
    modelComponentList:Array<ComponentModelComponent>;
}