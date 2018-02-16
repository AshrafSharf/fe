import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { ProjectService } from '../../../services/project.service';
import { TableViewHeader } from '../../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../../shared/interfaces/tableview-column';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import {SettingsService} from '../../../services/settings.service';
import { Branch } from '../../../shared/interfaces/branch';
import { AppVariableService } from '../../../services/variable.services';
import { Variable, KeyValuePair, TableInputPair } from '../../../shared/interfaces/variables';
import { Moment, unix } from 'moment';
import { Utils } from '../../../shared/utils';
import { Config } from '../../../shared/config';

@Component({
    selector: 'forecast-tabular',
    templateUrl: './forecast.tabular.component.html',
    styleUrls: ['./forecast.tabular.component.css']
})

export class ForecastTabularComponent implements OnInit {
    @ViewChild('projectList') selectedProject:ElementRef;
    columns:TableViewHeader[];
    rows:TableViewRow[] = new Array<TableViewRow>();
    projects:Project[] = new Array<Project>();
    branches:Branch[] = new Array<Branch>();
    variables:Variable[] = new Array<Variable>();
    originalVariables:Variable[] = new Array<Variable>();

    distribution:Boolean = false;
    timeSegDistributionIndexes = [];
    started:Boolean = false;

    subVarTitleIndexes = [];
    distributionTitleIndexes = [];
    distributionAndSubVariableTitleIndexes = [];
    varType:String;

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    titles = [];
    titleOccurs = 0;

    varDecimal="";
    breakdownDecimal= "";
    datePickerConfig = { format : Config.getDateFormat() };


    private navigationIndex = 0;
    private currentBranch: String;

    processedVariables:Variable[] = Array<Variable>();
    keys = new Array<string>();
    openStatuses:Boolean[] = Array<Boolean>();

    searchName:String = '';
    searchType:String = '';
    searchOwner:String = '';

    startDate: Moment;
    endDate: Moment;

    constructor(private router:Router,
                private branchService:BranchService,
                private modal: ModalDialogService,
                private projectService:ProjectService,
                private settingsService:SettingsService,
                private variableService:AppVariableService) {
    }

    ngOnInit() {
        let currentDate = new Date();

        this.startDate = unix(currentDate.getTime() / 1000).subtract(6, 'months');
        this.endDate = unix(currentDate.getTime() / 1000).add(12, 'months');

        this.reloadProjects();
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariables(event) {
        //this.currentBranch = event.target.value;
        this.reloadVariables(event.target.value);
    }

    reloadProjects() {
        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    console.log(result);
                    this.projects = result.data;
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId:String = null) {
        this.rows.splice(0, this.rows.length);
        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));

        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        this.currentBranch = id.toString();

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    if (result.status == "OK") {
                        console.log(result);
                        this.branches = result.data as Array<Branch>;
                        this.reloadVariables();
                    }
                });
        }
    }

    reloadVariables(branchId:String = null) {

        var id = branchId;
        if ((branchId == null) && (this.branches.length > 0)) {
            id = this.branches[0].id;
        }

        this.currentBranch = id;
        this.navigationIndex = 0;

        if (id != null) {
            this.variableService
                .getVariables(id)
                .subscribe(result => {
                    if (result.status == "OK") {
                        console.log(result);
                        this.variables = result.data as Array<Variable>;
                        this.variables.forEach(variable => {
                            this.originalVariables.push(variable);
                        });
                        this.processVarables();
                    }
                });
        }
    }

    processVarables() {
        // clear
        this.processedVariables.splice(0, this.processedVariables.length);
        this.keys.splice(0, this.keys.length);
        this.openStatuses.splice(0, this.openStatuses.length);

        var keySet = new Set();
        // start collecting the unique keys
        for(var index = 0; index < this.variables.length; index++) {
            let variable = this.variables[index];
            for(var resultIndex = 0; resultIndex < variable.allTimesegmentsResultList.length; resultIndex++) {
                let result = variable.allTimesegmentsResultList[resultIndex];
                for (var pairIndex = 0; pairIndex < result.data.length; pairIndex++) {
                    let pair = result.data[pairIndex];
                    keySet.add(pair.title);
                }
            }

            this.openStatuses.push(false);
        }        
        
        // needed for sorting
        keySet.forEach(key => {
            this.keys.push(key);
        });
        
        // sort the keys (sort the months and years)
        this.keys.sort();

        // fill the missing dates
        Utils.fillMissingDates(this.keys);

        console.log(this.keys);

        //get the decimal setting
        var dec = this.varDecimal;
        this.settingsService
        .getSettings()
        .subscribe(settings => {
            let settingData = settings.data as {id:String, key:String, value:String}[];
            settingData.forEach(setting => {
                if (setting.key == "VARIABLE_DECIMAL"){
                    this.varDecimal = setting.value.toString();
                    dec = setting.value.toString(); 
                }
                else if(setting.key == "BREAKDOWN_DECIMAL"){
                    this.breakdownDecimal = setting.value.toString();
                }
            });
            console.log("number of dec", dec);

             // process the values
            for(var index = 0; index < this.variables.length; index++) {
                let variable = this.variables[index];
                for(var resultIndex = 0; resultIndex < variable.allTimesegmentsResultList.length; resultIndex++) {
                    let result = variable.allTimesegmentsResultList[resultIndex];
                    let currentVarType = variable.variableType;
                    let currentValType = variable.valueType;
                    let decimalsToKeep = this.getDecimalSetting(currentVarType, currentValType);
                    var data:{title:String, value:number|string}[] = Array<{title:String, value:number|string}>();
                    this.keys.forEach(key => {
                        var found = false;
                        for (var pairIndex = 0; pairIndex < result.data.length; pairIndex++) {
                            let pair = result.data[pairIndex];
                            if (key == pair.title) {
                                let value = pair.value as number;
                                data.push({
                                    title: pair.title,
                                    value: value.toFixed(decimalsToKeep)
                                });
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            data.push({
                                title: key,
                                value: '- na -'
                            });
                        }
                    });

                    result.data = data;
                }
            }
        });
    }

    toggleOpen(index) {
        if (this.openStatuses[index]) {
            this.openStatuses[index] = false;
        } else {
            this.openStatuses[index] = true;
        }
    }

    filterResult(event, type) {
        this.variables.splice(0, this.variables.length);

        for (var index = 0; index < this.originalVariables.length; index++) {
            var variable = this.originalVariables[index];
            if ((variable.title.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) &&
            (variable.variableType.toLowerCase().indexOf(this.searchType.toLowerCase()) >= 0) &&
            (variable.ownerName.toLowerCase().indexOf(this.searchOwner.toLowerCase()) >= 0)) {
                this.variables.push(variable);
            }
        }

        this.processVarables();
    }

    getDecimalSetting(varType, valType){
        if (varType == 'breakdown' && valType == 'real'){
            return parseInt(this.breakdownDecimal);
        }
        else if (valType == 'real'){
            return parseInt(this.varDecimal);
        }
        else{
            return 0;
        }
    }
}


