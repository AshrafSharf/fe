import { OnInit, Component, Input, SimpleChanges, OnChanges, style } from "@angular/core";
import { AppVariableService } from "../../services/variable.services";
import { TableViewRow } from "../../shared/interfaces/tableview-row";
import { TableViewColumn } from "../../shared/interfaces/tableview-column";
import { InputVariableMatching } from "../../shared/interfaces/input-variable-matching";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'match-table',
    templateUrl: './match-table.component.html',
    styleUrls:['./match-table.component.css']
})

export class MatchTableComponenet implements OnInit, OnChanges {
    @Input('inputVars') inputVariableList: string[];
    @Input('forecastBranchId') forecastBranchID: string;

   inputVariableMatchings:InputVariableMatching[] = [];

    constructor(
        private variableService: AppVariableService,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    
    ngOnInit() { 
        
    }

    ngOnChanges(changes: SimpleChanges){
        this.matchVariables();
    }

    /** 
     * Checks each input variable to see if it has a matching forecast variable
     * @returns a list of input variable names and whether they have a forecast variable match or not
    */
    matchVariables(): InputVariableMatching[]{
        //clear existing matchings
        this.inputVariableMatchings.splice(0, this.inputVariableMatchings.length);

        for (let index=0; index<this.inputVariableList.length; index++){
            let match = false;
           this.variableService.getVariableByName(this.forecastBranchID, this.inputVariableList[index])
           .subscribe(result => {
                let forecastVariable = result.data;
                   if (forecastVariable != null){
                       match = true;
                   }
                   else{
                       match=false;
                   }
                   this.inputVariableMatchings.push({
                    inputVariableName: this.inputVariableList[index],
                    hasForecastMatch: match,
                    value:""
                    });  
            });          
        }
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