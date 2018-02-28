import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { Branch } from '../../../shared/interfaces/branch';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { ProjectService } from '../../../services/project.service';
import { AppVariableService } from '../../../services/variable.services';
import { Variable } from '../../../shared/interfaces/variables';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import {SettingsService} from '../../../services/settings.service';
import 'nvd3';
import { Utils } from '../../../shared/utils';
import { Moment, unix } from 'moment';
import { Config } from '../../../shared/config';


@Component({
    selector: 'forecast-graphical',
    templateUrl: './forecast.graphical.component.html',
    styleUrls: ['./forecast.graphical.component.css']
})

export class ForecastGraphicalComponent implements OnInit {
    projects: Project[] = new Array<Project>();
    branches:Branch[] = new Array<Branch>();
    variables:Variable[] = new Array<Variable>();
    filteredVariables: Variable[] = new Array<Variable>();
    private exludedVariables: String[] = new Array<String>();
    searchName:String = '';
    searchType:String = '';
    searchOwner:String = '';

    breakdownVariables:Boolean = true;
    discreteVariables:Boolean = false;
    breakdownLines:Boolean = true;
    distributionLines:Boolean = true;

    startDate: Moment;
    endDate: Moment;

    datePickerConfig = { format : Config.getDateFormat() };
    decimal = "";
    comma="";

    public lineChartData:Array<any> = [];
    public lineChartLabels:Array<{key: number, value:string}> = [];

    public lineChartColors:Array<any> = [];
    private navigationIndex = 0;

    currentProject: String;
    currentBranch: String;

    data;
    options;

    constructor(
        private router: Router,
        private branchService:BranchService,
        private projectService: ProjectService,
        private variableService: AppVariableService,
        private settingsService: SettingsService,
        private modal: ModalDialogService) {
    }

    ngOnInit() {
        this.resetDates();
        this.reloadProjects();
    }

    resetDates() {
        let currentDate = new Date();
        this.startDate = unix(currentDate.getTime() / 1000).subtract(6, 'months');
        this.endDate = unix(currentDate.getTime() / 1000).add(12, 'months');
    }

    toggleBreakdownVariables(event) {
        this.breakdownVariables = event.target.checked;
        this.filteredVariables.splice(0, this.filteredVariables.length);
        for (var index = 0; index < this.variables.length; index++) {
            let variable = this.variables[index];
            if (this.shouldSkipVariable(variable) == true) {
                continue;
            }

            this.filteredVariables.push(variable);
        }
        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    toggleBreakdownLines(event) {
        this.breakdownLines = event.target.checked;
        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    shouldSkipVariable(variable): Boolean {
        if ((variable.variableType == 'breakdown') && (!this.breakdownVariables) ){
            return true;
        }

        if ((variable.valueType == 'discrete') && (!this.discreteVariables) ){
            return true;
        }

        return false;
    }

    toggleDiscreteVariables(event) {
        this.discreteVariables = event.target.checked;
        this.filteredVariables.splice(0, this.filteredVariables.length);
        for (var index = 0; index < this.variables.length; index++) {
            let variable = this.variables[index];
            if (this.shouldSkipVariable(variable) == true) {
                continue;
            }

            this.filteredVariables.push(variable);
        }
        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    toggleDistributionLines(event) {
        this.distributionLines = event.target.checked;
        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    loadPreviousMonths() {
        this.navigationIndex -= 1;
        this.reloadMonths();
    }

    loadNextMonths() {
        this.navigationIndex += 1;
        this.reloadMonths();
    }

    filterResult(event, type) {
        this.filteredVariables.splice(0, this.filteredVariables.length);

        for (var index = 0; index < this.variables.length; index++) {
            var variable = this.variables[index];
            if ((variable.title.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) &&
                (variable.variableType.toLowerCase().indexOf(this.searchType.toLowerCase()) >= 0) &&
                (variable.ownerName.toLowerCase().indexOf(this.searchOwner.toLowerCase()) >= 0)) {

                if (this.shouldSkipVariable(variable) == true) {
                    continue;
                }

                this.filteredVariables.push(variable);
            }
        }
    }

    reloadMonths() {
        this.variableService
            .extendValuesForMonths(this.currentBranch, this.navigationIndex)
            .subscribe(result => {
                console.log(result);
                this.variables = result.data as Array<Variable>;
                this.clearChart();
                setTimeout(() => {this.renderChart();}, 100);
            })
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

    reloadBranches(projectId:String = null) {
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

    isVariableExcluded(id) {
        this.exludedVariables.forEach(varId => {
            if (varId == id) {
                return true;
            }
        })

        return false;
    }

    clearAllVariables() {
        this.filteredVariables.splice(0, this.filteredVariables.length);

        this.exludedVariables.splice(0, this.exludedVariables.length);
        this.variables.forEach(variable => {
            this.exludedVariables.push(variable.id);
            this.filteredVariables.push(variable);
        })
    }

    reloadVariables(branchId:String = null) {
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
                        this.reloadGraph();
                    }
                });
        }
    }

    processVariableData() {
        this.filteredVariables.splice(0, this.filteredVariables.length);

        this.exludedVariables = [];
        this.variables.forEach(variable => {
            if (!this.shouldSkipVariable(variable)) {
                this.exludedVariables.push(variable.id);
                this.filteredVariables.push(variable);
            }
        })

        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    isLabelAdded(title):number {
        for (var index = 0; index < this.lineChartLabels.length; index++) {
            if (this.lineChartLabels[index].value == title) {
                return this.lineChartLabels[index].key;
            }
        }

        return -1;
    }

    excludeVariable(event) {
        if (event.target.checked == false) {
            this.exludedVariables.push(event.target.value);
        } else {
            for (var index = 0; index < this.exludedVariables.length; index++) {
                if (this.exludedVariables[index] == event.target.value) {
                    this.exludedVariables.splice(index, 1);
                    break;
                }
            }
        }

        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    clearChart() {
        this.lineChartLabels.splice(0, this.lineChartLabels.length);
        this.lineChartColors.splice(0, this.lineChartColors.length);
        this.lineChartData.splice(0, this.lineChartData.length);
    }

    renderChart() {
        this.lineChartLabels.splice(0, this.lineChartLabels.length);
        this.lineChartColors.splice(0, this.lineChartColors.length);
        this.lineChartData.splice(0, this.lineChartData.length);

        var totalSegments = 0;
        var minValue = 0;
        var maxValue = 0;

        // collect all keys
        var keyIndex = 0;
        /*
        for (var variableIndex = 0; variableIndex < this.variables.length; variableIndex ++) {
            let variable = this.variables[variableIndex];

            let skipVariable = false;
            for (var index = 0; index < this.exludedVariables.length; index++) {
                if (this.exludedVariables[index] == variable.id) {
                    skipVariable = true;
                    break;
                }
            }


            let finished = false;

            if (skipVariable) continue;
            if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
                for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
                    let alreadyExecuted = false;
                    var dataValues = [];
                    var counter = 0;

                    let item = variable.allTimesegmentsResultList[index];

                    for (var dataIndex = 0; dataIndex < item.data.length; dataIndex++) {
                        var valueItem = item.data[dataIndex];
                        var labelIndex = this.isLabelAdded(valueItem.title);
                        if (labelIndex == -1) {
                            this.lineChartLabels.push(
                                {
                                    key: keyIndex,
                                    value: valueItem.title.toString()
                                }
                            );

                            keyIndex += 1;
                        }
                    }
                }
            }
        }
        */

        this.lineChartLabels.splice(0, this.lineChartLabels.length);
        let months = this.endDate.diff(this.startDate, 'months') + 1;
        let tempDate = this.startDate.clone();
        for (var index = 0; index < months; index++) {
            this.lineChartLabels.push(
                {
                    key: index,
                    value: tempDate.format('YYYY-MM')
                }
            );

            tempDate.add(1, 'months');
        }
        console.log(this.lineChartLabels);

        var colorIndex = 0;
        for (var variableIndex = 0; variableIndex < this.variables.length; variableIndex ++) {
            let variable = this.variables[variableIndex];

            let skipVariable = false;
            for (var index = 0; index < this.exludedVariables.length; index++) {
                if (this.exludedVariables[index] == variable.id) {
                    skipVariable = true;
                    break;
                }
            }

            if (skipVariable) continue;

            if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
                if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
                    var color = Utils.getRandomColor(colorIndex);
                    colorIndex += 1;
                    for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
                        var dataValues = [];
                        let item = variable.allTimesegmentsResultList[index];

                        this.lineChartLabels.forEach(pair => {
                            let found = false;
                            for (var dataIndex = 0; dataIndex < item.data.length; dataIndex++) {
                                var valueItem = item.data[dataIndex];
                                if (pair.value == valueItem.title) {
                                    found = true;
                                    //var num = parseInt(valueItem.value.toString());
                                    var num = parseFloat(valueItem.value.toString());
                                    if (num < minValue) minValue = num;
                                    if (num > maxValue) maxValue = num;

                                    dataValues.push({ x: pair.key, y:num});
                                    break;
                                }
                            }

                            if (!found) {
                                dataValues.push({ x: pair.key, y: undefined});
                            }
                        });


                        if (index == 0) {
                            var itemKey = (item.title == "-total") ? variable.title +"" + item.title : item.title;
                            console.log(itemKey);
                            this.lineChartData.push({
                                values: dataValues,
                                key: itemKey,
                                color: color
                            });
                        } else {
                            if (variable.variableType != 'breakdown') {
                                var itemKey =item.title;

                                if (index % 2 != 0) {
                                    // odd
                                    color = Utils.getShadeOfColor(color, 0.5);
                                }

                                 //add title total to the sigma of the base line if it has subvariables
                                if (item.calculationType == "GAUSSIAN_CALCULATION" && variable.compositeType == "breakdown"){
                                    itemKey = item.title + "."+ "total";
                                }

                                if (item.calculationType == "GAUSSIAN_CALCULATION") {
                                    if (this.distributionLines != false) {
                                        this.lineChartData.push({
                                            values: dataValues,
                                            key: itemKey,
                                            classed: 'dashed',
                                            color: color
                                        });
                                    }
                                }
                                else if (item.calculationType == "SUBVARIABLE_CALCULATION") {
                                    if (this.breakdownLines != false) {
                                        this.lineChartData.push({
                                            values: dataValues,
                                            key: itemKey,
                                            //classed: 'dotted',
                                            color: color
                                        });
                                    }
                                }
                                else if (item.calculationType == "GAUSSIAN_SUBVARIABLE_CALCULATION") {
                                    if (this.breakdownLines != false && this.distributionLines != false) {
                                        this.lineChartData.push({
                                            values: dataValues,
                                            key: itemKey,
                                            classed: 'dotted',
                                            color: color
                                        });
                                    }
                                }


                            } else {
                                if (this.breakdownLines == false) continue;

                                color = Utils.getShadeOfColor(color, 0.5);
                                this.lineChartData.push({
                                    values: dataValues,
                                    key:  variable.title +""+item.title,
                                    color: color
                                });
                            }
                        }
                    }
                }
            }
        }
        var dec = this.decimal;
        var com = this.comma;
        this.settingsService
            .getSettings()
            .subscribe(settings => {
                let data = settings.data as {id:String, key:String, value:String}[];
                data.forEach(setting => {
                    if (setting.key == "VARIABLE_DECIMAL"){
                        this.decimal = setting.value.toString();
                        dec = setting.value.toString();
                    }
                    else if (setting.key == "COMMA_CHECK"){
                        var commaCheck = setting.value.toString();
                        this.comma = (commaCheck == "true" ? "," : "");
                        com = (commaCheck == "true" ? "," : "");
                    }
                });
                this.options = {
                    chart: {
                    type: 'lineChart',
                    height: 450,
                    x: (d) => { return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    interactiveLayer: {
                        tooltip: {
                            valueFormatter:(d, i) => {
                                return d3.format(com+".0"+dec+"f")(d);
                        }
                    }
                    },
                    xAxis: {
                        axisLabel: '',
                        tickFormat: (d) => {
                            let pair = this.lineChartLabels[d];
                            if (pair == undefined) return '';
                            return pair.value;
                        }
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: function(d) {
                            return Utils.formatNumber(d);
                            // return d3.format(com+".0"+dec+"f")(d);
                        },
                        axisLabelDistance: -10
                    },
                    yDomain: [minValue, maxValue],
                    showLegend: true,
                    },
                };
            });
    }

    reloadGraph() {
        this.variableService
            .getCalculationsFor(
                this.currentBranch,
                this.startDate.format(Config.getDateFormat()),
                this.endDate.format(Config.getDateFormat()))
            .subscribe(result => {
                console.log(result);
                this.variables = result.data as Array<Variable>;
                this.processVariableData();
            });
    }

}
