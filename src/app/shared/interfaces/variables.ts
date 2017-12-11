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
    userSelectedParametrics: String;
    startTime: String;
    inputMethod: String;
    growth: Number;
    distributionType: String;
    description: String;
    constantValue: Number;
    mean: String;
    stdDeviation: String;
    userSelectedParametricsStdDeviation: String;
    timeSegmentResponse: { resultMap: { title:String, data: {title:String, value: Number}[] }[] };
}