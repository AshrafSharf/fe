import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { Branch } from '../../../shared/interfaces/branch';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { ProjectService } from '../../../services/project.service';
import { AppVariableService } from '../../../services/variable.services';
import { Variable } from '../../../shared/interfaces/variables';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import 'nvd3';
import { Utils } from '../../../shared/utils';
import { Moment, unix } from 'moment';


@Component({
    selector: 'forecast-graphical',
    templateUrl: './forecast.graphical.component.html'
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
    discreteLines:Boolean = false;

    previousValidDate: any;
    currentDate: Date;
    startDate: Date;
    endDate: Date;
    currentDateLabel:String;

    datePickerConfig = { format : 'DD-MM-YYYY hh:mm' };
    userSelectedStartDate: any;
    userSelectedEndDate: any;

    variablesEarliestStart:any;
    variablesLatestEnd:any;
    dateLabel:string;

    public lineChartData:Array<any> = [];
    public lineChartLabels:Array<{key: number, value:string}> = [];

    public lineChartColors:Array<any> = [];
    private navigationIndex = 0;

    private currentBranch: String;

    data;
    options;

    constructor(
        private router: Router,
        private branchService:BranchService,
        private projectService: ProjectService,
        private variableService: AppVariableService,
        private modal: ModalDialogService) {
    }

    ngOnInit() {
        this.currentDate = new Date();
        this.startDate = new Date();
        this.startDate.setMonth((this.startDate.getMonth())-6);
        this.endDate = new Date();
        this.endDate.setMonth((this.endDate.getMonth())+12);

        let date:Date;
        date = new Date();

        this.userSelectedStartDate = unix(date.setMonth((this.currentDate.getMonth())-6) / 1000);
        date = new Date();
        this.userSelectedEndDate= unix(date.setFullYear((this.currentDate.getFullYear())+1) / 1000);
        var momentStartDate = this.userSelectedStartDate.format("DD-MM-YYYY hh:mm");
        var momentEndDate = this.userSelectedEndDate.format("DD-MM-YYYY hh:mm");

        this.previousValidDate = this.userSelectedStartDate;

        if ((this.currentDate.getMonth()).toString().length > 1) {
            this.currentDateLabel = this.currentDate.getFullYear() + "-" + this.currentDate.getMonth();
        }
        else {
            this.currentDateLabel = this.currentDate.getFullYear() + "-0" + this.currentDate.getMonth();
        }

        this.options = {
            chart: {
                type: 'lineChart',
                height: 450,
                x: (d) => { return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
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
                    tickFormat: function(d){
                        return d;
                    },
                    axisLabelDistance: -10
                },
                axisLabelDistance: -10,
                showLegend: true   
            }
        };

        this.reloadProjects();
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

    toggleDiscreteLines(event) {
        this.discreteLines = event.target.checked;
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
        //this.currentBranch = event.target.value;
        console.log(event.target.value);
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
                        this.variables = result.data as Array<Variable>;
                        this.filteredVariables.splice(0, this.filteredVariables.length);

                        this.exludedVariables = [];
                        this.variables.forEach(variable => {
                            if (!this.shouldSkipVariable(variable)) {
                                this.exludedVariables.push(variable.id);
                                this.filteredVariables.push(variable);
                            }
                        })
                        this.setEarliestStartAndEndTimes();
                        console.log("rendering chart");
                        this.clearChart();
                        setTimeout(() => {this.renderChart();}, 100);
                    }
                });
        }
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

            var keyIndex = 0;
            if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
                for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
                    let alreadyExecuted = false;
                    var dataValues = [];
                    var counter = 0;

                    let item = variable.allTimesegmentsResultList[index];

                    let timeFrameMonthDifference = this.getMonthDifference(this.startDate, this.endDate);
                    var dataIndex = 0;

                    for (var monthIndex = 0; monthIndex < timeFrameMonthDifference; monthIndex++) {
                        if (index > 0) {
                            if ((variable.variableType == 'breakdown') || (variable.compositeType == 'breakdown')) {
                                if (!this.breakdownLines) {
                                    continue;
                                }
                            }
                        }

                        var valueItem;
                        var variableFirstTimeSegStart = new Date((variable.timeSegment[0].startTime[3] + variable.timeSegment[0].startTime[4] + "/" + variable.timeSegment[0].startTime[0] + variable.timeSegment[0].startTime[1] + "/" + variable.timeSegment[0].startTime[6]+variable.timeSegment[0].startTime[7]+variable.timeSegment[0].startTime[8]+variable.timeSegment[0].startTime[9]).toString());
                        var monthDifference = 0;
                        var year;
                        var month;

                        if (variableFirstTimeSegStart < this.startDate) {
                            monthDifference = this.getMonthDifference(variableFirstTimeSegStart, this.startDate);

                            dataIndex = counter + monthDifference;
                            counter++;
                        }
                        else {
                            if (!alreadyExecuted) {
                                if (variableFirstTimeSegStart > this.startDate) {
                                    if (variableFirstTimeSegStart > this.endDate) {
                                        month = (this.startDate.getMonth())+1;
                                        year = this.startDate.getFullYear();
                                        for (var monthIndex = 0; monthIndex < timeFrameMonthDifference; monthIndex++) {
                                            if (month > 12) {
                                                month = 1;
                                                year = year + 1;
                                            }

                                            if ((month).toString().length > 1) {
                                                this.dateLabel = year + "-" + month;
                                            }
                                            else {
                                                this.dateLabel = year + "-0" + month;
                                            }

                                            valueItem = {title: this.dateLabel, value: null};

                                            var labelIndex = this.isLabelAdded(valueItem.title);
                                            if (labelIndex == -1) {
                                                this.lineChartLabels.push(
                                                    {
                                                        key: keyIndex,
                                                        value: valueItem.title.toString()
                                                    }
                                                );
                                                labelIndex = keyIndex;
                                                keyIndex += 1;
                                            }
                                            dataValues.push({x:labelIndex, y: valueItem.value});
                                            month++;
                                        }
                                        break;
                                    }
                                    else {
                                        monthDifference = this.getMonthDifference(this.startDate, variableFirstTimeSegStart);

                                        month = (this.startDate.getMonth())+1;
                                        year = this.startDate.getFullYear();
                                        for (var monthCounter = 1; monthCounter <= monthDifference; monthCounter++) {
                                            if (month > 12) {

                                                month = 0;

                                                month = month + 1;
                                                year = year + 1;
                                            }

                                            if ((month).toString().length > 1) {
                                                this.dateLabel = year + "-" + month;
                                            }
                                            else {
                                                this.dateLabel = year + "-0" + month;
                                            }

                                            valueItem = {title: this.dateLabel, value: null};

                                            var labelIndex = this.isLabelAdded(valueItem.title);
                                            if (labelIndex == -1) {
                                                this.lineChartLabels.push(
                                                    {
                                                        key: keyIndex,
                                                        value: valueItem.title.toString()
                                                    }
                                                );
                                                labelIndex = keyIndex;
                                                keyIndex += 1;
                                            }
                                            dataValues.push({x:labelIndex, y: valueItem.value});
                                            month++;
                                            monthIndex++;
                                        }
                                        alreadyExecuted = true;
                                    }
                                }
                            }
                        }

                        if (item.data[dataIndex] != null) {
                            valueItem = item.data[dataIndex];
                            var labelIndex = this.isLabelAdded(valueItem.title);
                            this.dateLabel = valueItem.title;
                            if (labelIndex == -1) {
                                this.lineChartLabels.push(
                                    {
                                        key: keyIndex,
                                        value: valueItem.title.toString()
                                    }
                                );
                                labelIndex = keyIndex;
                                keyIndex += 1;
                            }
                            dataValues.push({x:labelIndex, y: valueItem.value});
                            dataIndex++;
                        }

                        else {
                            var year:any;
                            var month:any;
                            year = parseInt(this.dateLabel[0] + this.dateLabel[1] + this.dateLabel[2] + this.dateLabel[3]);
                            if (this.dateLabel[5] != "0") {
                                month = parseInt(this.dateLabel[5] + this.dateLabel[6]);
                            }
                            else {
                                month = parseInt(this.dateLabel[6]);
                            }

                            month = month + 1;
                            if (month > 12) {
                                month = 1;
                                year = year + 1;
                            }

                            if ((month).toString().length > 1) {
                                this.dateLabel = year + "-" + month;
                            }
                            else {
                                this.dateLabel = year + "-0" + month;
                            }

                            valueItem = {title: this.dateLabel, value: null};
                            var labelIndex = this.isLabelAdded(valueItem.title);
                            if (labelIndex == -1) {
                                this.lineChartLabels.push(
                                    {
                                        key: keyIndex,
                                        value: valueItem.title.toString()
                                    }
                                );
                                labelIndex = keyIndex;
                                keyIndex += 1;
                            }
                          
                            dataValues.push({x:labelIndex, y: d3.format("0.2f")( valueItem.value)});     
                        }
                    }

                    this.lineChartData.push({
                        values: dataValues,
                        key: item.title
                    });
                }
            }
        }
    }

    reset() {
        this.navigationIndex = 0;
        this.currentDate = new Date();
        this.startDate = new Date();
        this.startDate.setMonth((this.startDate.getMonth())-6);
        this.endDate = new Date();
        this.endDate.setMonth((this.endDate.getMonth())+12);

        let date:Date;
        date = new Date();

        this.userSelectedStartDate = unix(date.setMonth((this.currentDate.getMonth())-6) / 1000);
        date = new Date();
        this.userSelectedEndDate= unix(date.setFullYear((this.currentDate.getFullYear())+1) / 1000);

        this.previousValidDate = this.userSelectedStartDate;

        var momentStartDate = this.userSelectedStartDate.format("DD-MM-YYYY hh:mm");
        var momentEndDate = this.userSelectedEndDate.format("DD-MM-YYYY hh:mm");

        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
    }

    setNewDates(startDate, endDate) {
        this.userSelectedStartDate = unix(startDate / 1000);
        this.userSelectedEndDate= unix(endDate / 1000);
        var formattedStartDate = this.userSelectedStartDate.format("DD-MM-YYYY hh:mm");
        var formattedEndDate = this.userSelectedEndDate.format("DD-MM-YYYY hh:mm");
        var userStart = new Date((formattedStartDate[3] + formattedStartDate[4] + "/" + formattedStartDate[0] + formattedStartDate[1] + "/" + formattedStartDate[6]+formattedStartDate[7]+formattedStartDate[8]+formattedStartDate[9]).toString());
        var userEnd = new Date((formattedEndDate[3] + formattedEndDate[4] + "/" + formattedEndDate[0] + formattedEndDate[1] + "/" + formattedEndDate[6]+formattedEndDate[7]+formattedEndDate[8]+formattedEndDate[9]).toString());

        console.log(this.variablesLatestEnd);

        if (userStart < this.startDate) {
            if (userStart < this.variablesEarliestStart) {
                this.modal.showError("Cannot have a start time earlier than earliest start time of a variable i.e. earliest variable start time is "+this.variablesEarliestStart);
                this.userSelectedStartDate = this.previousValidDate;
            }
            else {
                this.previousValidDate = this.userSelectedStartDate;
                this.startDate = userStart;
                //this.endDate = userEnd;

                if (userEnd > this.endDate) {

                    var monthDifference = this.getMonthDifference(this.endDate, userEnd);
                    monthDifference = monthDifference +1;

                    if (monthDifference < 6) {
                        this.navigationIndex = 1;
                        this.reloadMonths();
                    }
                    else if (monthDifference > 6 && monthDifference < 12) {
                        this.navigationIndex = 2;
                        this.reloadMonths();
                    }
                    else if (monthDifference > 12 && monthDifference < 18) {
                        this.navigationIndex = 3;
                        this.reloadMonths();
                    }
                    else {
                        this.navigationIndex = 4;
                        this.reloadMonths();
                    }
                    this.endDate = userEnd;
                }
                else{
                    this.endDate = userEnd;
                    this.clearChart();
                    setTimeout(() => {this.renderChart();}, 100);
                }
            }
        }

        else {
            this.previousValidDate = this.userSelectedStartDate;
            this.startDate = userStart;
            //this.endDate = userEnd;

            if (userEnd > this.endDate) {
                var monthDifference = this.getMonthDifference(this.endDate, userEnd);
                monthDifference = monthDifference +1;

                if (monthDifference < 6) {
                    this.navigationIndex = 1;
                    this.reloadMonths();
                }
                else if (monthDifference > 6 && monthDifference < 12) {
                    this.navigationIndex = 2;
                    this.reloadMonths();
                }
                else if (monthDifference > 12 && monthDifference < 18) {
                    this.navigationIndex = 3;
                    this.reloadMonths();
                }
                else {
                    this.navigationIndex = 4;
                    this.reloadMonths();
                }
                this.endDate = userEnd;
            }
            else{
                this.endDate = userEnd;
                this.clearChart();
                setTimeout(() => {this.renderChart();}, 100);
            }
        }

    }

    getMonthDifference(date1, date2) {
        var months;

        months = (date2.getFullYear() - date1.getFullYear()) * 12;
        months -= date1.getMonth() + 1;
        months += date2.getMonth() + 1;
        return months <= 0 ? 0 : months;
    }

    setEarliestStartAndEndTimes() {
        this.variables.forEach(variable => {

            for (var index = 0; index < variable.timeSegment.length; index++) {

                var startDate = new Date((variable.timeSegment[index].startTime[3] + variable.timeSegment[index].startTime[4] + "/" + variable.timeSegment[index].startTime[0] + variable.timeSegment[index].startTime[1] + "/" + variable.timeSegment[index].startTime[6]+variable.timeSegment[index].startTime[7]+variable.timeSegment[index].startTime[8]+variable.timeSegment[index].startTime[9]).toString());

                if (variable.timeSegment[index].startTime == null) {
                    var endDate = new Date(null);
                }
                else {
                    var endDate = new Date((variable.timeSegment[index].endTime[3] + variable.timeSegment[index].endTime[4] + "/" + variable.timeSegment[index].endTime[0] + variable.timeSegment[index].endTime[1] + "/" + variable.timeSegment[index].endTime[6]+variable.timeSegment[index].endTime[7]+variable.timeSegment[index].endTime[8]+variable.timeSegment[index].endTime[9]).toString());
                }

                if (this.variablesEarliestStart == null) {
                    this.variablesEarliestStart = startDate;
                }
                else {
                    if (startDate < this.variablesEarliestStart) {
                        this.variablesEarliestStart = startDate;
                    }
                }

                if (this.variablesLatestEnd == null) {
                    this.variablesLatestEnd = endDate;
                }
                else {
                    if (endDate > this.variablesLatestEnd) {
                        this.variablesLatestEnd = endDate;
                    }
                }
            }
        });
    }
}
