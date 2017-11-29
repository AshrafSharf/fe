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
    timeSegment: Array<TimeSegment>;
    variableType: String;
    valueType: String;
}

export interface KeyValuePair {
    id: String;
    title: String;
}

export interface TimeSegment {
    timeSegmentResponse: { resultMap: {}[] };
}