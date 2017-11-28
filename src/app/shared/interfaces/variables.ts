export interface ValidationResult {
    result: boolean;
    reason: String;
}

export interface VariableComponentBehavior {
    isValid(): ValidationResult;
    getInput();
}

export interface Variable {
    id: String;
    branchId: String;
    title: String;
    ownerId: String;
    ownerName: String;
    timeSegment: Array<{}>;
    variableType: String;
    valueType: String;
}