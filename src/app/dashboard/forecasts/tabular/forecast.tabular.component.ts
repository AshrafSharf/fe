import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { ProjectService } from '../../../services/project.service';
import { TableViewHeader } from '../../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../../shared/interfaces/tableview-column';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { Branch } from '../../../shared/interfaces/branch';
import { AppVariableService } from '../../../services/variable.services';
import { Variable } from '../../../shared/interfaces/variables';

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

    timeUnit:String;
    startTime:String;
    endTime:String;
    actualsStartTime:String;

    earliestStart:Date;
    latestEnd:Date;
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

    isLoading:Boolean = false;

    private navigationIndex = 0;

    private currentBranch: String;


    constructor(private router:Router,
                private branchService:BranchService,
                private modal:Modal,
                private projectService:ProjectService,
                private variableService:AppVariableService) {
    }

    ngOnInit() {
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
                        this.populateTable(id);
                    }
                });
        }
    }

    // Populate table view component
    populateTable(id) {
        for (var index = 0; index < (this.branches).length; index++) {
            if (this.branches[index].id == id) {
                this.timeUnit = this.branches[index].timeUnit;
            }
        }

        this.earliestStart = null;
        this.latestEnd = null;

        if ((this.timeUnit).toLowerCase() == "month") {

            // Each variable time segment object is stored in variables array
            var variables = [];
            this.variables.forEach(variable => {
                variables.push(variable.timeSegment);
            });


            // Determine the earliest start and latest end time for a branch
            variables.forEach(timeSeg => {

                for (var index = 0; index < timeSeg.length; index++) {
                    var startDate = new Date((timeSeg[index].startTime[3] + timeSeg[index].startTime[4] + "/" + timeSeg[index].startTime[0] + timeSeg[index].startTime[1] + "/" + timeSeg[index].startTime[6]+timeSeg[index].startTime[7]+timeSeg[index].startTime[8]+timeSeg[index].startTime[9]).toString());

                    if (timeSeg[index].endTime == null) {
                        var endDate = new Date(null);
                    }
                    else {
                        var endDate = new Date((timeSeg[index].endTime[3] + timeSeg[index].endTime[4] + "/" + timeSeg[index].endTime[0] + timeSeg[index].endTime[1] + "/" + timeSeg[index].endTime[6]+timeSeg[index].endTime[7]+timeSeg[index].endTime[8]+timeSeg[index].endTime[9]).toString());
                    }

                    if (this.earliestStart == null) {
                        this.earliestStart = startDate;
                    }
                    else {
                        if (startDate < this.earliestStart) {
                            this.earliestStart = startDate;
                        }
                    }

                    if (this.latestEnd == null) {
                        this.latestEnd = endDate;
                    }
                    else {
                        if (endDate > this.latestEnd) {
                            this.latestEnd = endDate;
                        }
                    }
                }

            });


            var monthDifference = this.getMonthDifference(this.earliestStart, this.latestEnd);
            var startMonthIndex = this.earliestStart.getMonth();
            var endMonthIndex = this.latestEnd.getMonth();

            var noOfColumns = 0;

            this.columns = new Array<TableViewHeader>();
            this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));

            var noOfColumns = 0;

            // Set the column headers for the table
            if (monthDifference != 0) {

                var year = this.earliestStart.getFullYear();
                var diff = monthDifference +1;

                for (var index1 = 0; index1 < (diff+1); index1++) {
                    for (var index2 = startMonthIndex; index2 < 12; index2++) {
                        this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index2] + " " + year, "col-md-3", "", ""));
                        diff--;
                        noOfColumns++;
                        if (diff == 0) {
                            break;
                        }
                    }
                    startMonthIndex = 0;
                    year++;
                }
            }

            var varIndex = 0;
            var varTitle;

            var timeSegStart;
            var timeSegStartMonth;
            var timeSegStartYear;
            var timeSegStartDate;

            var value = 0;
            var columnCounter = 0;

            // Add data to rows
            this.rows = new Array<TableViewRow>();
            this.variables.forEach(variable => {

                varTitle = variable.title;
                this.started = false;

                this.varType = variable.valueType;

                variables[varIndex].forEach(timeSeg => {
                    if (timeSeg.timeSegmentResponse != null) {
                        timeSeg.timeSegmentResponse.resultMap.forEach(title => {
                            this.titles.push(title);
                        });
                    }
                });

                for (var index = 0; index < variables[varIndex].length; index++) {
                    if (variables[varIndex][index].timeSegmentResponse != null) {
                        var row = new TableViewRow(variable.id);
                        row.addColumn(new TableViewColumn("name", variable.title + " " + variables[varIndex][index].timeSegmentResponse.resultMap[0].title));
                        //row.addColumn(new TableViewColumn("name", variable.title));

                        //this.titles.push(variable.title);

                        // If a variable has more than 1 time segment
                        if (variables[varIndex].length > 1) {

                            for (var index = 0; index < variables[varIndex].length; index++) {
                                if (variables[varIndex][index].timeSegmentResponse != null) {

                                    // Determining the start time for a specific time segment
                                    timeSegStart = variable.timeSegment[index].startTime;

                                    if (timeSegStart[3] == 0) {
                                        timeSegStartMonth = timeSegStart[4];
                                        timeSegStartMonth = timeSegStartMonth - 1;
                                    }
                                    else {
                                        timeSegStartMonth = timeSegStart[3]+timeSegStart[4];
                                        timeSegStartMonth = timeSegStartMonth - 1;
                                    }

                                    timeSegStartYear = timeSegStart[6]+timeSegStart[7]+timeSegStart[8]+timeSegStart[9];

                                    timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                    // Adding the data under the appropriate columns
                                    for (var x = 1; x < this.columns.length; x ++) {

                                        // If the start time for a variable has been found, output all data values for all time segments
                                        if (this.started) {
                                            if (this.columns[x].placeHolder == timeSegStartDate) {
                                                for (var index1 = 0; index1 < (variables[varIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                    if (variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                        row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                    }
                                                    else {
                                                        value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                        if (this.varType == "integer") {
                                                            row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                        }
                                                        else if (this.varType == "real") {
                                                            row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                        }
                                                    }
                                                    columnCounter++;
                                                }
                                                break;
                                            }
                                        }
                                        else {
                                            if (this.columns[x].placeHolder == timeSegStartDate) {
                                                this.started = true;
                                                for (var index1 = 0; index1 < (variables[varIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                    if (variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                        row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                    }
                                                    else {
                                                        value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                        if (this.varType == "integer") {
                                                            row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                        }
                                                        else if (this.varType == "real") {
                                                            row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                        }
                                                    }
                                                    columnCounter++;
                                                }
                                                break;
                                            }
                                            else {
                                                row.addColumn(new TableViewColumn("Column " + x, "n/a"));
                                                columnCounter++;
                                            }
                                        }
                                    }

                                    // If a variable's resultMap contains more than 1 instance then set the 'this.distribution'
                                    // boolean to true and add the index of the time segment to the this.timeSegDistributionIndexes array
                                    if ((variables[varIndex][index].timeSegmentResponse.resultMap).length > 1) {
                                        this.distribution = true;
                                        this.timeSegDistributionIndexes.push(index);
                                    }
                                }
                                else {
                                    for (var col = 0; col < (this.columns.length)-1; col++) {
                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                        columnCounter++;
                                    }
                                }
                            }

                            // If there is empty space between the end of the of the result map and the end of the table, add 'n/a' for empty values
                            if (columnCounter < this.columns.length) {
                                for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                    columnCounter++;
                                }
                            }

                            this.rows.push(row);
                            columnCounter = 0;
                            this.started = false;

                            var startedCol = 0;

                            // If a variable has a distribution in any time segments, output the results on a new line under the correct date column header
                            if (this.distribution == true) {

                                this.timeSegDistributionIndexes.forEach(dist => {
                                    for (var index1 = 0; index1 < ((variables[varIndex][dist].timeSegmentResponse.resultMap).length) - 1; index1++) {

                                        if ((variables[varIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('Σ') > -1) {
                                            if ((variables[varIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('.') > -1) {
                                                this.distributionAndSubVariableTitleIndexes.push(index1 + 1);
                                            }
                                            else {
                                                this.distributionTitleIndexes.push(index1 + 1);
                                            }
                                        }
                                        else if ((variables[varIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('.') > -1) {
                                            this.subVarTitleIndexes.push(index1 + 1);
                                        }
                                    }

                                    for (var index1 = 0; index1 < ((variables[varIndex][dist].timeSegmentResponse.resultMap).length) - 1; index1++) {

                                        if (this.distributionTitleIndexes[0] != null) {

                                            this.distributionTitleIndexes.forEach(distIndex => {

                                                row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].title));

                                                column = 0;

                                                this.titles.forEach(resultMapTitle => {
                                                    if (variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].title == resultMapTitle.title) {
                                                        this.titleOccurs = this.titleOccurs+1;
                                                    }
                                                });

                                                for (var index = 0; index < (this.titleOccurs); index++) {
                                                    if (index != 0) {

                                                        this.timeSegDistributionIndexes.forEach(prevDists => {


                                                            if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].title == variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].title) {
                                                                if(prevDists != dist) {
                                                                    if (variables[varIndex][prevDists].timeSegmentResponse != null) {

                                                                        // Determining the start time for a specific time segment
                                                                        timeSegStart = variable.timeSegment[prevDists].startTime;

                                                                        if (timeSegStart[3] == 0) {
                                                                            timeSegStartMonth = timeSegStart[4];
                                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                                        }
                                                                        else {
                                                                            timeSegStartMonth = timeSegStart[3] + timeSegStart[4];
                                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                                        }

                                                                        timeSegStartYear = timeSegStart[6] + timeSegStart[7] + timeSegStart[8] + timeSegStart[9];

                                                                        timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                                                        for (var col = 1; col < this.columns.length; col ++) {

                                                                            if (this.started) {
                                                                                if (startedCol < this.columns.length) {
                                                                                    if (this.columns[startedCol].placeHolder == timeSegStartDate) {
                                                                                        for (var index1 = 0; index1 < (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data).length; index1++) {

                                                                                            if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data[index1] == null) {
                                                                                                row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                                                            }
                                                                                            else {
                                                                                                value = parseFloat(variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data[index1].value);
                                                                                                if (this.varType == "integer") {
                                                                                                    row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                                                                }
                                                                                                else if (this.varType == "real") {
                                                                                                    row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                                                                }
                                                                                            }
                                                                                            columnCounter++;
                                                                                            startedCol++;
                                                                                        }
                                                                                        break;
                                                                                    }
                                                                                    else {
                                                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                        columnCounter++;
                                                                                    }
                                                                                    startedCol++;
                                                                                }

                                                                            }

                                                                            else {
                                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                                    this.started = true;
                                                                                    for (var index2 = 0; index2 < (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data).length; index2++) {
                                                                                        if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data[index2] == null) {
                                                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                        }
                                                                                        else {
                                                                                            value = parseFloat(variables[varIndex][prevDists].timeSegmentResponse.resultMap[distIndex].data[index2].value);
                                                                                            if (this.varType == "integer") {
                                                                                                row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                                            }
                                                                                            else if (this.varType == "real") {
                                                                                                row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                                            }
                                                                                        }
                                                                                        columnCounter++;
                                                                                    }
                                                                                    startedCol = columnCounter + 1;
                                                                                    break;
                                                                                }

                                                                                else {
                                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                    columnCounter++;
                                                                                }
                                                                            }

                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        });

                                                    }

                                                    else {
                                                        if (variables[varIndex][dist].timeSegmentResponse != null) {

                                                            // Determining the start time for a specific time segment
                                                            timeSegStart = variable.timeSegment[dist].startTime;

                                                            if (timeSegStart[3] == 0) {
                                                                timeSegStartMonth = timeSegStart[4];
                                                                timeSegStartMonth = timeSegStartMonth - 1;
                                                            }
                                                            else {
                                                                timeSegStartMonth = timeSegStart[3] + timeSegStart[4];
                                                                timeSegStartMonth = timeSegStartMonth - 1;
                                                            }

                                                            timeSegStartYear = timeSegStart[6] + timeSegStart[7] + timeSegStart[8] + timeSegStart[9];

                                                            timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                                            for (var col = 1; col < this.columns.length; col ++) {

                                                                if (this.started) {
                                                                    if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                        for (var index1 = 0; index1 < (variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data).length; index1++) {

                                                                            if (variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data[index1] == null) {
                                                                                row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                                            }
                                                                            else {
                                                                                value = parseFloat(variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data[index1].value);
                                                                                if (this.varType == "integer") {
                                                                                    row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                                                }
                                                                                else if (this.varType == "real") {
                                                                                    row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                                                }
                                                                            }
                                                                            columnCounter++;
                                                                        }
                                                                        startedCol = columnCounter + 1;
                                                                        break;
                                                                    }
                                                                }

                                                                else {
                                                                    if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                        this.started = true;
                                                                        for (var index2 = 0; index2 < (variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data).length; index2++) {
                                                                            if (variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data[index2] == null) {
                                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                            }
                                                                            else {
                                                                                value = parseFloat(variables[varIndex][dist].timeSegmentResponse.resultMap[distIndex].data[index2].value);
                                                                                if (this.varType == "integer") {
                                                                                    row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                                }
                                                                                else if (this.varType == "real") {
                                                                                    row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                                }
                                                                            }
                                                                            columnCounter++;
                                                                        }
                                                                        startedCol = columnCounter + 1;
                                                                        break;
                                                                    }

                                                                    else {
                                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                        columnCounter++;
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }

                                                }

                                                if (columnCounter < this.columns.length) {
                                                    for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                        columnCounter++;
                                                    }
                                                }

                                                columnCounter = 0;
                                                this.rows.push(row);
                                                this.started = false;
                                                this.titleOccurs = 0;
                                            });
                                        }

                                        if (this.subVarTitleIndexes[0] != null) {

                                            this.subVarTitleIndexes.forEach(subVarIndex => {

                                                row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][dist].timeSegmentResponse.resultMap[subVarIndex].title));

                                                this.titles.forEach(resultMapTitle => {
                                                    if (variables[varIndex][dist].timeSegmentResponse.resultMap[subVarIndex].title == resultMapTitle.title) {
                                                        this.titleOccurs = this.titleOccurs+1;
                                                    }
                                                });

                                                column = 0;

                                                for (var index = 0; index < variables[varIndex].length; index++) {
                                                    if (variables[varIndex][index].timeSegmentResponse != null) {

                                                        // Determining the start time for a specific time segment
                                                        timeSegStart = variable.timeSegment[index].startTime;

                                                        if (timeSegStart[3] == 0) {
                                                            timeSegStartMonth = timeSegStart[4];
                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                        }
                                                        else {
                                                            timeSegStartMonth = timeSegStart[3] + timeSegStart[4];
                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                        }

                                                        timeSegStartYear = timeSegStart[6] + timeSegStart[7] + timeSegStart[8] + timeSegStart[9];

                                                        timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                                        for (var col = 1; col < this.columns.length; col ++) {

                                                            if (this.started) {
                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                    for (var index1 = 0; index1 < (variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data).length; index1++) {

                                                                        if (variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data[index1] == null) {
                                                                            row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                                        }
                                                                        else {
                                                                            value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data[index1].value);
                                                                            if (this.varType == "integer") {
                                                                                row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                                            }
                                                                            else if (this.varType == "real") {
                                                                                row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                                            }
                                                                        }
                                                                        columnCounter++;
                                                                    }
                                                                    break;
                                                                }
                                                            }

                                                            else
                                                            {
                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                    this.started = true;
                                                                    for (var index2 = 0; index2 < (variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data).length; index2++) {
                                                                        if (variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data[index2] == null) {
                                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                            columnCounter++;
                                                                        }
                                                                        else {
                                                                            value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[subVarIndex].data[index2].value);
                                                                            if (this.varType == "integer") {
                                                                                row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                            }
                                                                            else if (this.varType == "real") {
                                                                                row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                            }
                                                                            columnCounter++;
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                    columnCounter++;
                                                                }
                                                            }

                                                        }

                                                    }
                                                }

                                                if (columnCounter < this.columns.length) {
                                                    for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                        columnCounter++;
                                                    }
                                                }

                                                columnCounter = 0;

                                                this.started = false;
                                                this.titleOccurs = 0;
                                                this.rows.push(row);

                                                if (this.distributionAndSubVariableTitleIndexes[0] != null) {

                                                    var match = false;

                                                    this.distributionAndSubVariableTitleIndexes.forEach(distSubVarIndex => {

                                                        var title = variables[varIndex][dist].timeSegmentResponse.resultMap[subVarIndex].title;
                                                        title = title.replace(' ', '');

                                                        if ((variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].title).indexOf(title) > -1) {
                                                            match = true;
                                                        }

                                                        if (match) {

                                                            row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                            row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].title));

                                                            column = 0;

                                                            this.titles.forEach(resultMapTitle => {
                                                                if (variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].title == resultMapTitle.title) {
                                                                    this.titleOccurs = this.titleOccurs+1;
                                                                }
                                                            });

                                                            for (var index = 0; index < (this.titleOccurs); index++) {
                                                                if (index != 0) {

                                                                    this.timeSegDistributionIndexes.forEach(prevDists => {


                                                                        if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].title == variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].title) {
                                                                            if(prevDists != dist) {
                                                                                if (variables[varIndex][prevDists].timeSegmentResponse != null) {

                                                                                    // Determining the start time for a specific time segment
                                                                                    timeSegStart = variable.timeSegment[prevDists].startTime;

                                                                                    if (timeSegStart[3] == 0) {
                                                                                        timeSegStartMonth = timeSegStart[4];
                                                                                        timeSegStartMonth = timeSegStartMonth - 1;
                                                                                    }
                                                                                    else {
                                                                                        timeSegStartMonth = timeSegStart[3] + timeSegStart[4];
                                                                                        timeSegStartMonth = timeSegStartMonth - 1;
                                                                                    }

                                                                                    timeSegStartYear = timeSegStart[6] + timeSegStart[7] + timeSegStart[8] + timeSegStart[9];

                                                                                    timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                                                                    for (var col = 1; col < this.columns.length; col ++) {

                                                                                        if (this.started) {
                                                                                            if (startedCol < this.columns.length) {
                                                                                                if (this.columns[startedCol].placeHolder == timeSegStartDate) {
                                                                                                    for (var index1 = 0; index1 < (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data).length; index1++) {

                                                                                                        if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data[index1] == null) {
                                                                                                            row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                                                                        }
                                                                                                        else {
                                                                                                            value = parseFloat(variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data[index1].value);
                                                                                                            if (this.varType == "integer") {
                                                                                                                row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                                                                            }
                                                                                                            else if (this.varType == "real") {
                                                                                                                row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                                                                            }
                                                                                                        }
                                                                                                        columnCounter++;
                                                                                                        startedCol++;
                                                                                                    }
                                                                                                    break;
                                                                                                }
                                                                                                else {
                                                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                                    columnCounter++;
                                                                                                }
                                                                                                startedCol++;
                                                                                            }

                                                                                        }

                                                                                        else {
                                                                                            if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                                                this.started = true;
                                                                                                for (var index2 = 0; index2 < (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data).length; index2++) {
                                                                                                    if (variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data[index2] == null) {
                                                                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                                    }
                                                                                                    else {
                                                                                                        value = parseFloat(variables[varIndex][prevDists].timeSegmentResponse.resultMap[distSubVarIndex].data[index2].value);
                                                                                                        if (this.varType == "integer") {
                                                                                                            row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                                                        }
                                                                                                        else if (this.varType == "real") {
                                                                                                            row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                                                        }
                                                                                                    }
                                                                                                    columnCounter++;
                                                                                                }
                                                                                                startedCol = columnCounter + 1;
                                                                                                break;
                                                                                            }

                                                                                            else {
                                                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                                columnCounter++;
                                                                                            }
                                                                                        }

                                                                                    }
                                                                                }
                                                                            }

                                                                        }
                                                                    });

                                                                }

                                                                else {
                                                                    if (variables[varIndex][dist].timeSegmentResponse != null) {

                                                                        // Determining the start time for a specific time segment
                                                                        timeSegStart = variable.timeSegment[dist].startTime;

                                                                        if (timeSegStart[3] == 0) {
                                                                            timeSegStartMonth = timeSegStart[4];
                                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                                        }
                                                                        else {
                                                                            timeSegStartMonth = timeSegStart[3] + timeSegStart[4];
                                                                            timeSegStartMonth = timeSegStartMonth - 1;
                                                                        }

                                                                        timeSegStartYear = timeSegStart[6] + timeSegStart[7] + timeSegStart[8] + timeSegStart[9];

                                                                        timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;

                                                                        for (var col = 1; col < this.columns.length; col ++) {

                                                                            if (this.started) {
                                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                                    for (var index1 = 0; index1 < (variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data).length; index1++) {

                                                                                        if (variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data[index1] == null) {
                                                                                            row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                                                        }
                                                                                        else {
                                                                                            value = parseFloat(variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data[index1].value);
                                                                                            if (this.varType == "integer") {
                                                                                                row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                                                            }
                                                                                            else if (this.varType == "real") {
                                                                                                row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                                                            }
                                                                                        }
                                                                                        columnCounter++;
                                                                                    }
                                                                                    startedCol = columnCounter + 1;
                                                                                    break;
                                                                                }
                                                                            }

                                                                            else {
                                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                                    this.started = true;
                                                                                    for (var index2 = 0; index2 < (variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data).length; index2++) {
                                                                                        if (variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data[index2] == null) {
                                                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                        }
                                                                                        else {
                                                                                            value = parseFloat(variables[varIndex][dist].timeSegmentResponse.resultMap[distSubVarIndex].data[index2].value);
                                                                                            if (this.varType == "integer") {
                                                                                                row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                                            }
                                                                                            else if (this.varType == "real") {
                                                                                                row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                                            }
                                                                                        }
                                                                                        columnCounter++;
                                                                                    }
                                                                                    startedCol = columnCounter + 1;
                                                                                    break;
                                                                                }

                                                                                else {
                                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                                    columnCounter++;
                                                                                }
                                                                            }

                                                                        }
                                                                    }
                                                                }

                                                            }


                                                            if (columnCounter < this.columns.length) {
                                                                for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                    columnCounter++;
                                                                }
                                                            }
                                                            columnCounter = 0;

                                                            this.started = false;
                                                            this.rows.push(row);
                                                            match = false;
                                                        }
                                                    });
                                                }


                                            });
                                        }
                                        break;
                                    }

                                    this.distributionTitleIndexes = [];
                                    this.subVarTitleIndexes = [];
                                    this.distributionAndSubVariableTitleIndexes = [];
                                });
                            }
                        }
                        // If a variable only has 1 time segment
                        else {

                            timeSegStart = variable.timeSegment[0].startTime;

                            if (timeSegStart[3] == 0) {
                                timeSegStartMonth = timeSegStart[4];
                                timeSegStartMonth = timeSegStartMonth - 1;
                            }
                            else {
                                timeSegStartMonth = timeSegStart[3]+timeSegStart[4];
                                timeSegStartMonth = timeSegStartMonth - 1;
                            }

                            timeSegStartYear = timeSegStart[6]+timeSegStart[7]+timeSegStart[8]+timeSegStart[9];

                            timeSegStartDate = this.months[timeSegStartMonth] + " " + timeSegStartYear;


                            if (variables[varIndex][0].timeSegmentResponse != null) {

                                for (var x = 1; x < this.columns.length; x ++) {

                                    if (this.started) {
                                        if (this.columns[x].placeHolder == timeSegStartDate) {
                                            for (var index1 = 0; index1 < (variables[varIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                if (variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                    columnCounter++;
                                                }
                                                else {
                                                    value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                    if (this.varType == "integer") {
                                                        row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                    }
                                                    else if (this.varType == "real") {
                                                        row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                    }
                                                    columnCounter++;
                                                }
                                            }

                                            if (columnCounter < this.columns.length) {
                                                for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                    columnCounter++;
                                                }
                                            }
                                            this.rows.push(row);
                                            columnCounter = 0;
                                            break;
                                        }
                                    }
                                    else {
                                        if (this.columns[x].placeHolder == timeSegStartDate) {
                                            this.started = true;
                                            for (var index1 = 0; index1 < (variables[varIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                if (variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                    columnCounter++;
                                                }
                                                else {
                                                    value = parseFloat(variables[varIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                    if (this.varType == "integer") {
                                                        row.addColumn(new TableViewColumn("Column " + index1, (Math.round(value)).toString()));
                                                    }
                                                    else if (this.varType == "real") {
                                                        row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                    }
                                                    columnCounter++;
                                                }
                                            }

                                            if (columnCounter < this.columns.length) {
                                                for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                    columnCounter++;
                                                }
                                            }
                                            this.rows.push(row);
                                            columnCounter = 0;
                                            break;
                                        }
                                        else {
                                            row.addColumn(new TableViewColumn("Column " + x, "n/a"));
                                            columnCounter++;
                                        }
                                    }

                                }
                                this.started = false;

                                // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                                if ((variables[varIndex][0].timeSegmentResponse.resultMap).length > 1) {

                                    for (var index1 = 0; index1 < ((variables[varIndex][0].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                        if ((variables[varIndex][0].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('Σ') > -1) {
                                            if ((variables[varIndex][0].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('.') > -1) {
                                                this.distributionAndSubVariableTitleIndexes.push(index1 + 1);
                                            }
                                            else {
                                                this.distributionTitleIndexes.push(index1 + 1);
                                            }
                                        }
                                        else if ((variables[varIndex][0].timeSegmentResponse.resultMap[index1 + 1].title).indexOf('.') > -1) {
                                            this.subVarTitleIndexes.push(index1 + 1);
                                        }
                                    }

                                    for (var index1 = 0; index1 < ((variables[varIndex][0].timeSegmentResponse.resultMap).length) - 1; index1++) {

                                        if (this.distributionTitleIndexes[0] != null) {

                                            this.distributionTitleIndexes.forEach(distIndex => {

                                                row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][0].timeSegmentResponse.resultMap[distIndex].title));

                                                column = 0;

                                                for (var col = 1; col < this.columns.length; col ++) {

                                                    if (this.columns[col].placeHolder == timeSegStartDate) {
                                                        this.started = true;
                                                        for (var index2 = 0; index2 < (variables[varIndex][0].timeSegmentResponse.resultMap[0].data).length; index2++) {
                                                            if (variables[varIndex][0].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                columnCounter++;
                                                            }
                                                            else {
                                                                value = parseFloat(variables[varIndex][0].timeSegmentResponse.resultMap[distIndex].data[index2].value);
                                                                if (this.varType == "integer") {
                                                                    row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                }
                                                                else if (this.varType == "real") {
                                                                    row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                }
                                                                columnCounter++;
                                                            }
                                                        }

                                                        if (columnCounter < this.columns.length) {
                                                            for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                columnCounter++;
                                                            }
                                                        }
                                                        columnCounter = 0;
                                                        break;
                                                    }
                                                    else {
                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                        columnCounter++;
                                                    }
                                                }
                                                this.rows.push(row);
                                            });
                                        }

                                        if (this.subVarTitleIndexes[0] != null) {

                                            this.subVarTitleIndexes.forEach(subVarIndex => {

                                                row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][0].timeSegmentResponse.resultMap[subVarIndex].title));

                                                column = 0;

                                                for (var col = 1; col < this.columns.length; col ++) {

                                                    if (this.columns[col].placeHolder == timeSegStartDate) {
                                                        this.started = true;
                                                        for (var index2 = 0; index2 < (variables[varIndex][0].timeSegmentResponse.resultMap[subVarIndex].data).length; index2++) {
                                                            if (variables[varIndex][0].timeSegmentResponse.resultMap[subVarIndex].data[index2] == null) {
                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                columnCounter++;
                                                            }
                                                            else {
                                                                value = parseFloat(variables[varIndex][0].timeSegmentResponse.resultMap[subVarIndex].data[index2].value);
                                                                if (this.varType == "integer") {
                                                                    row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                }
                                                                else if (this.varType == "real") {
                                                                    row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                }
                                                                columnCounter++;
                                                            }
                                                        }

                                                        if (columnCounter < this.columns.length) {
                                                            for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                columnCounter++;
                                                            }
                                                        }

                                                        columnCounter = 0;
                                                        break;
                                                    }
                                                    else {
                                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                        columnCounter++;
                                                    }
                                                }
                                                this.rows.push(row);

                                                if (this.distributionAndSubVariableTitleIndexes[0] != null) {

                                                    var match = false;

                                                    this.distributionAndSubVariableTitleIndexes.forEach(distSubVarIndex => {

                                                        var title = variables[varIndex][0].timeSegmentResponse.resultMap[subVarIndex].title;
                                                        title = title.replace(' ', '');

                                                        if ((variables[varIndex][0].timeSegmentResponse.resultMap[distSubVarIndex].title).indexOf(title) > -1) {
                                                            match = true;
                                                        }

                                                        if (match) {

                                                            row = new TableViewRow(variable.id + "." + (index1 + 1));
                                                            row.addColumn(new TableViewColumn("name", varTitle + " " + variables[varIndex][0].timeSegmentResponse.resultMap[distSubVarIndex].title));

                                                            column = 0;

                                                            for (var col = 1; col < this.columns.length; col ++) {

                                                                if (this.columns[col].placeHolder == timeSegStartDate) {
                                                                    this.started = true;
                                                                    for (var index2 = 0; index2 < (variables[varIndex][0].timeSegmentResponse.resultMap[0].data).length; index2++) {
                                                                        if (variables[varIndex][0].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                            columnCounter++;
                                                                        }
                                                                        else {
                                                                            value = parseFloat(variables[varIndex][0].timeSegmentResponse.resultMap[distSubVarIndex].data[index2].value);
                                                                            if (this.varType == "integer") {
                                                                                row.addColumn(new TableViewColumn("Column " + col, (Math.round(value)).toString()));
                                                                            }
                                                                            else if (this.varType == "real") {
                                                                                row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
                                                                            }
                                                                            columnCounter++;
                                                                        }
                                                                    }

                                                                    if (columnCounter < this.columns.length) {
                                                                        for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                            columnCounter++;
                                                                        }
                                                                    }
                                                                    columnCounter = 0;
                                                                    break;
                                                                }
                                                                else {
                                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                                    columnCounter++;
                                                                }
                                                            }
                                                            this.rows.push(row);
                                                            match = false;
                                                        }
                                                    });
                                                }

                                            });
                                        }
                                        break;
                                    }

                                    this.distributionTitleIndexes = [];
                                    this.subVarTitleIndexes = [];
                                    this.distributionAndSubVariableTitleIndexes = [];
                                }
                            }
                            else {
                                for (var column = 0; column < (this.columns.length)-1; column++) {
                                    row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                    columnCounter++;
                                }

                                if (columnCounter < this.columns.length) {
                                    for (var col = columnCounter; col < (this.columns.length)-1; col++) {
                                        row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                        columnCounter++;
                                    }
                                }
                                this.rows.push(row);
                                columnCounter = 0;
                            }
                        }
                    }
                }

                this.timeSegDistributionIndexes.length = 0;
                this.distribution = false;
                varIndex++;
            });
            this.titles = [];
        }

        else if ((this.timeUnit).toLowerCase() == "week") {

        }
    }

    // Get number of months between two dates
    getMonthDifference(date1, date2) {
        var months;

        months = (date2.getFullYear() - date1.getFullYear()) * 12;
        months -= date1.getMonth() + 1;
        months += date2.getMonth() + 1;
        return months <= 0 ? 0 : months;
    }


    loadPreviousMonths() {
        this.navigationIndex -= 1;
        this.reloadMonths();
    }

    loadNextMonths() {
        this.navigationIndex += 1;
        this.reloadMonths();
    }

    /*
    reloadMonths() {
        this.variableService
            .extendValuesForMonths("5a65f4c7d49fee09a042bcfd", this.navigationIndex)
            .subscribe(result => {
                console.log(result);
                this.variables = result.data as Array<Variable>;
                console.log("reloadMonths: "+this.currentBranch+ " "+this.navigationIndex);
                this.populateTable(this.currentBranch);
                //this.clearChart();
                //setTimeout(() => {this.renderChart();}, 100);
            })
    }

*/
    reloadMonths() {
        this.variableService
            .extendValuesForMonths(this.currentBranch, this.navigationIndex)
            .subscribe(result => {
                console.log(result);
                this.variables = result.data as Array<Variable>;
                this.populateTable(this.currentBranch);
                //this.clearChart();
                //setTimeout(() => {this.renderChart();}, 100);
            })
    }

}

