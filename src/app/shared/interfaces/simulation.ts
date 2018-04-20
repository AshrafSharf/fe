import { InputVariableMatching } from "./input-variable-matching";

export interface Simulation{
    id:string;
    projectId:string;
    modelBranchId:string;
    forecastBranchd:string;
    title:string;
    ownerName:string;
    ownerId:string;
    description:string;
    startDate:string;
    endDate:string;
    matchings:InputVariableMatching[];
    iterations:string;
    instantRun:boolean;
    continous:boolean;
    performMonteCarloCalc:boolean;
    frequency:string;

}