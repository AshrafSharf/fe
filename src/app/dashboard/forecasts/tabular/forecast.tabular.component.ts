import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { ProjectService } from '../../../services/project.service';
import { TableViewHeader } from '../../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../../shared/interfaces/tableview-column';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { SettingsService } from '../../../services/settings.service';
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
    @ViewChild('projectList') selectedProject: ElementRef;
    rows: TableViewRow[] = new Array<TableViewRow>();
    projects: Project[] = new Array<Project>();
    branches: Branch[] = new Array<Branch>();
    variables: Variable[] = new Array<Variable>();
    originalVariables: Variable[] = new Array<Variable>();

    distribution: Boolean = false;
    timeSegDistributionIndexes = [];
    started: Boolean = false;

    subVarTitleIndexes = [];
    distributionTitleIndexes = [];
    distributionAndSubVariableTitleIndexes = [];
    varType: String;

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    titles = [];
    titleOccurs = 0;

    varDecimal = "";
    breakdownDecimal = "";
    commaCheck = "";
    datePickerConfig = { format: Config.getDateFormat() };


    private navigationIndex = 0;
    currentProject: String;
    currentBranch: String;

    processedVariables: Variable[] = Array<Variable>();
    keys = new Array<string>();
    openStatuses: Boolean[] = Array<Boolean>();

    searchName: String = '';
    searchType: String = '';
    searchOwner: String = '';

    startDate: Moment;
    endDate: Moment;

    minStartDate: Moment = unix(new Date().getTime() / 1000);

    constructor(private router: Router,
        private branchService: BranchService,
        private modal: ModalDialogService,
        private projectService: ProjectService,
        private settingsService: SettingsService,
        private variableService: AppVariableService) {
    }

    ngOnInit() {
        this.resetDates();
        this.reloadProjects();
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariables(event) {
        Utils.selectProject(this.currentProject);
        Utils.selectBranch(this.currentProject, event.target.value);
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

    reloadBranches(projectId: String = null) {
        this.rows.splice(0, this.rows.length);

        var id = projectId;
        if (projectId == null) {
            if (Utils.getLastSelectedProject() != undefined) {
                id = Utils.getLastSelectedProject();
            } else if (this.projects.length > 0) {
                id = this.projects[0].id;
            }
        }

        this.currentProject = id.toString();
        Utils.selectProject(this.currentProject);

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

    reloadVariables(branchId: String = null) {
        var id = branchId;
        if (branchId == null) {
            if (Utils.getLastSelectedBranch() != undefined) {
                let bId = Utils.getLastSelectedBranch();
                let ids = bId.split('-');
                if (this.currentProject == ids[0]) {
                    id = ids[1];
                } else {
                    if (this.branches.length > 0) {
                        id = this.branches[0].id;
                    }
                }
            } else if (this.branches.length > 0) {
                id = this.branches[0].id;
            }
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
                        this.originalVariables = new Array<Variable>();
                        this.variables.forEach(variable => {
                            this.originalVariables.push(variable);
                        });

                        this.findMinimumStartDate();

                        this.processVarables();
                    }
                });
        }
    }

    /** 
    Find the minium start date. Iterate over all the timesegments and find the smallest date
    */
    findMinimumStartDate() {
        // reset the minimum start date
        this.minStartDate = unix(new Date().getTime() / 1000);

        // get the lowest possible start date
        for (var index = 0; index < this.variables.length; index++) {
            let variable = this.variables[index];
            let dates = [];
            for (var resultIndex = 0; resultIndex < variable.timeSegment.length; resultIndex++) {
                let timeSegment = variable.timeSegment[resultIndex];
                dates.push(timeSegment.startTime);
            }

            if (variable.hasActual) {
                dates.push(variable.actualTimeSegment.startTime);
            }

            // sort the date
            dates.sort();

            if (dates.length > 0) {
                let components = dates[0].split('-');
                let month = components[0];
                let year = components[1];

                let date = new Date(`${month}/01/${year}`);
                let moment = unix(date.getTime() / 1000);
                if (moment.isBefore(this.minStartDate)) {
                    this.minStartDate = moment;
                }
            }
        }

        // if the min start date is > start date 
        // if (this.minStartDate.isAfter(this.startDate)) {
        this.startDate = this.minStartDate;
        // }
    }

    resetDates() {
        let currentDate = new Date();
        this.startDate = this.minStartDate;// unix(currentDate.getTime() / 1000).subtract(6, 'months');
        this.endDate = unix(currentDate.getTime() / 1000).add(12, 'months');
    }

    processVarables() {
        // clear
        this.processedVariables.splice(0, this.processedVariables.length);
        this.keys.splice(0, this.keys.length);
        this.openStatuses.splice(0, this.openStatuses.length);

        /*
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
        */

        let months = this.endDate.diff(this.startDate, 'months') + 1;
        let tempDate = this.startDate.clone();
        for (var index = 0; index < months; index++) {
            this.keys.push(tempDate.format('YYYY-MM'));
            tempDate.add(1, 'months');
        }

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

                let settingData = settings.data as { id: String, key: String, value: String }[];
                settingData.forEach(setting => {
                    if (setting.key == "VARIABLE_DECIMAL") {
                        this.varDecimal = setting.value.toString();
                        dec = setting.value.toString();
                    }
                    else if (setting.key == "BREAKDOWN_DECIMAL") {
                        this.breakdownDecimal = setting.value.toString();
                    }
                    else if (setting.key == "COMMA_CHECK") {
                        this.commaCheck = setting.value.toString();
                    }
                });

                // process the values
                for (var index = 0; index < this.variables.length; index++) {
                    let variable = this.variables[index];
                    for (var resultIndex = 0; resultIndex < variable.allTimesegmentsResultList.length; resultIndex++) {
                        let result = variable.allTimesegmentsResultList[resultIndex];
                        let currentVarType = variable.variableType;
                        let currentValType = variable.valueType;
                        let decimalsToKeep = this.getDecimalSetting(currentVarType, currentValType);
                        var data: { title: String, value: number | string }[] = Array<{ title: String, value: number | string }>();
                        this.keys.forEach(key => {
                            var found = false;
                            for (var pairIndex = 0; pairIndex < result.data.length; pairIndex++) {
                                let pair = result.data[pairIndex];
                                if (key == pair.title) {
                                    let value = pair.value as number;
                                    data.push({
                                        title: pair.title,
                                        value: this.formatNumber(value, decimalsToKeep)
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

    getDecimalSetting(varType, valType) {
        if (varType == 'breakdown' && valType == 'real') {
            return parseInt(this.breakdownDecimal);
        }
        else if (valType == 'real') {
            return parseInt(this.varDecimal);
        }
        else {
            return 0;
        }
    }

    reloadGraph() {
        if (this.startDate.isBefore(this.minStartDate)) {
            this.modal.showError('Start date can not be less than ' + this.minStartDate.format("MM-YYYY") + '. Please select correct start date.')
        } else if (this.endDate.isBefore(this.startDate)) {
            this.modal.showError("End date can not be less than start date. Please correct end date.");
        } else {
            this.variableService
                .getCalculationsFor(
                    this.currentBranch,
                    this.startDate.format(Config.getDateFormat()),
                    this.endDate.format(Config.getDateFormat()))
                .subscribe(result => {
                    console.log(result);
                    this.variables = result.data as Array<Variable>;
                    this.originalVariables = new Array<Variable>();
                    this.variables.forEach(variable => {
                        this.originalVariables.push(variable);
                    });

                    this.processVarables();
                });
        }
    }

    formatNumber(num, decimals) {
        if (this.commaCheck == "true") {
            return num.toFixed(decimals).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
        else {
            return num.toFixed(decimals);
        }
    }
    //formatNumber(num, decimals){
    //    if (this.commaCheck == "true"){
    //        return num.toFixed(decimals).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    //    }
    //    else{
    //        return num.toFixed(decimals);
    //    }

    //}
}


