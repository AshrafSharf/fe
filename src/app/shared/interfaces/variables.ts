import { SelectedWord } from "./auto-complete-input";

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
    subVariables: Subvariable[];
    compositeVariables: {id:String}[];
    compositeType: String;
    isSelected: Boolean;
    hasActual: Boolean;
    actualTimeSegment?: TimeSegment;
    allTimesegmentsResultList:{title:String, data:{title:String, value:number|string}[]}[];
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
    endTime?: String;
    inputMethod: String;
    tableInput:TableInputPair[];
    growth: Number;
    growthPeriod: Number;
    distributionType: String;
    description: String;
    constantValue: Number;
    //mean: String;
    stdDeviation: String;
    userSelectedParametricsStdDeviation: String;
    timeSegmentResponse?: { resultMap: { title:String, data: {title:String, value: Number}[] }[] };
    breakdownInput: Subvariable[];
    completedWordsArray: SelectedWord[];
    subVariables: Subvariable[];
    query?:String;
}

export interface VariableType {
    id: String;
    title: String;
    description: String;
    subVariables: Subvariable[];
    type: String;
    isSelected: Boolean;
}

export interface Subvariable {
    name: String;
    value: String;
    probability:String;
}

export interface DiscreteComponent {
    title: String;
    value: String;
    percentage: String;
}