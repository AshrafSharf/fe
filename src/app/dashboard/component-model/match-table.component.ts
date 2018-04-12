import { OnInit, Component, Input, SimpleChanges, OnChanges, style } from "@angular/core";
import { AppVariableService } from "../../services/variable.services";
import { TableViewRow } from "../../shared/interfaces/tableview-row";
import { TableViewColumn } from "../../shared/interfaces/tableview-column";
import { InputVariableMatching } from "../../shared/interfaces/input-variable-matching";
import { ActivatedRoute, Router } from "@angular/router";
import { ForecastVariableValue } from "../../shared/interfaces/forecast-variable-value";
import { CptInputVariable } from "../../shared/modelling/cpt-input-variable";
import { ModelService } from "../../services/model.service";
import { SystemModel } from "../../shared/interfaces/system-model";
import { InputVariable } from "../../shared/modelling/templates/input-variable";
import { Variable } from "../../shared/interfaces/variables";
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
    selector: 'match-table',
    templateUrl: './match-table.component.html',
    styleUrls:['./match-table.component.css']
})

export class MatchTableComponenet implements OnInit, OnChanges {
    @Input('forecastBranchId') forecastBranchID: string;
    @Input('modelId') modelId:string;
    @Input("showForecastNames") showForecastNames:boolean = false;
    @Input("allowOverride") allowOverride:boolean = true;
    @Input("vars") inputVariables:InputVariable[];

    forecastVariables: Variable[] = [];
    inputVariableMatchings:InputVariableMatching[] = [];
    
    constructor(
        private variableService: AppVariableService,
        private modelService: ModelService,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    
    ngOnInit() { 
        
    }

    ngOnChanges(changes: SimpleChanges){
        this.inputVariableMatchings.splice(0, this.inputVariableMatchings.length);
        //this.getInputVariables(this.modelId);
       
    }

    getForecastVariables(forecastBranchId: String, date:string){
        this.inputVariableMatchings.splice(0, this.inputVariableMatchings.length);
        this.variableService.gerVariableValuesByDate(forecastBranchId, date)
        .subscribe(result =>{
            this.forecastVariables = result.data;
            console.log(this.forecastVariables);
            this.matchVariables(forecastBranchId, date);
        });

    }

    /**
     * 
     * @param modelId the ID of the selectedModel
     */
    getInputVariables(modelId:string){
        this.modelService.getModel(modelId)
            .subscribe(result=>{
                let model = result.data as SystemModel;
                console.log(model.modelVariableInputList);
            });
    }


    /** 
     * Checks each input variable to see if it has a matching forecast variable
     * @returns a list of input variable names and whether they have a forecast variable match or not
    */
    matchVariables(forecastBranchId: String, date:string): InputVariableMatching[]{
   
        for (let index=0; index<this.inputVariables.length; index++){
            let match = false;
            let forecastValue = null;
            let forecastName= null;
            
            let forecastVarId = null;
            let formattedDate = moment(date, "MM-YYYY").format("YYYY-MM");
            console.log(formattedDate);
            for (let forecastVar of this.forecastVariables){
                console.log(forecastVar.title);
                if (this.inputVariables[index].name == forecastVar.title){
                    match = true;
                    forecastName=forecastVar.title;
                    let calculatedValues = forecastVar.allTimesegmentsResultList[0].data;
                    for (let monthValue of calculatedValues){
                        if (monthValue.title == formattedDate){
                            
                            forecastValue= monthValue.value;
                            break;
                        }
                    }
                    forecastVarId= forecastVar.id;
                    break;
                }
            } 
            this.inputVariableMatchings.push({
                inputVarId: this.inputVariables[index].id,
                inputVariableDisplayName: this.inputVariables[index].displayName,
                inputVariableName: this.inputVariables[index].name,
                hasForecastMatch: match,
                forecastValue: forecastValue,
                forecastVarName: forecastName,
                forecastVarId: forecastVarId,
                overrideValue:""
                
            });        
        }
        console.log(this.inputVariableMatchings);
        return this.inputVariableMatchings;  
    }
    /** 
     * Goes to 'Add Variable' screen of the defined forecast branch
    */
    onAddForecastVariable(){
        //TODO: use selected projectId
        this.router.navigate(["home/create-variable"], {queryParams:{
            projectId:"5aa31b14d49fee0db47f67c3",
            branchId: this.forecastBranchID
        }})
    }

}