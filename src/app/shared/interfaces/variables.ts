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
    description: String;
}

export interface KeyValuePair {
    id: String;
    title: String;
}

export interface TableInputPair {
    key: String;
    value: String;
}

export interface TimeSegment {
    userSelectedParametrics: String;
    startTime: String;
    inputMethod: String;
    tableInput:TableInputPair[];
    growth: Number;
    growthPeriod: Number;
    distributionType: String;
    description: String;
    constantValue: Number;
    mean: String;
    stdDeviation: String;
    userSelectedParametricsStdDeviation: String;
    timeSegmentResponse: { resultMap: { title:String, data: {title:String, value: Number}[] }[] };
    breakdownInput: Subvariable[];
}

export interface Subvariable {
    name: String;
    value: String;
}

export interface DiscreteComponent {
    title: String;
    value: String;
    percentage: String;
}