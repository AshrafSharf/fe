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

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    isLoading:Boolean = false;

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

            // Each variable time segment object is stored in variableTimeSegments array
            var variableTimeSegments = [];
            this.variables.forEach(variable => {
                variableTimeSegments.push(variable.timeSegment);
            });


            // Determine the earliest start and latest end time for a branch
            variableTimeSegments.forEach(timeSeg => {

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

                for (var index1 = 0; index1 < (diff); index1++) {
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

            var timeSegIndex = 0;
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

                for (var index = 0; index < variableTimeSegments[timeSegIndex].length; index++) {

                    var row = new TableViewRow(variable.id);
                    row.addColumn(new TableViewColumn("name", variable.title));


                    // If a variable has more than 1 time segment
                    if (variableTimeSegments[timeSegIndex].length > 1) {

                        for (var index = 0; index < variableTimeSegments[timeSegIndex].length; index++) {
                            if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse != null) {

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
                                            for (var index1 = 0; index1 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                    row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                }
                                                columnCounter++;
                                            }
                                            break;
                                        }
                                    }
                                    else {
                                        if (this.columns[x].placeHolder == timeSegStartDate) {
                                            this.started = true;
                                            for (var index1 = 0; index1 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                                if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                    row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
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
                                if ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length > 1) {
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

                        // If a variable has a distribution in any time segments, output the results on a new line under the correct date column header
                        if (this.distribution == true) {

                            this.timeSegDistributionIndexes.forEach(dist => {
                                for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap).length) - 1; index1++) {

                                    timeSegStart = variableTimeSegments[timeSegIndex][dist].startTime;

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


                                    row = new TableViewRow(variable.id + "." + (index1 + 1));
                                    row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title));

                                    for (var col = 1; col < this.columns.length; col ++) {

                                            if (this.columns[col].placeHolder == timeSegStartDate) {
                                                this.started = true;
                                                    for (var index2 = 0; index2 < (variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].data).length; index2++) {
                                                        if (variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].data[index2] == null) {
                                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                            columnCounter++
                                                        }
                                                        else {
                                                            value = parseFloat(variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                            row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
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
                                                row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                columnCounter++;
                                            }
                                    }
                                }
                            });
                        }
                    }
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


                        if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse != null) {

                            for (var x = 1; x < this.columns.length; x ++) {

                                if (this.started) {
                                    if (this.columns[x].placeHolder == timeSegStartDate) {
                                        for (var index1 = 0; index1 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                            if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                columnCounter++;
                                            }
                                            else {
                                                value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
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
                                        for (var index1 = 0; index1 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {

                                            if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                                row.addColumn(new TableViewColumn("Column " + index1, "n/a"));
                                                columnCounter++;
                                            }
                                            else {
                                                value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
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

                            // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                            if ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length > 1) {
                                for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                    row = new TableViewRow(variable.id + "." + (index1 + 1));
                                    row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].title));

                                    column = 0;

                                    for (var col = 1; col < this.columns.length; col ++) {

                                        if (this.columns[col].placeHolder == timeSegStartDate) {
                                            this.started = true;
                                            for (var index2 = 0; index2 < (variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data).length; index2++) {
                                                if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                                    columnCounter++;
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                    row.addColumn(new TableViewColumn("Column " + col, ((Math.round(value * 100)) / 100).toString()));
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
                                            row.addColumn(new TableViewColumn("Column " + col, "n/a"));
                                            columnCounter++;
                                        }
                                    }
                                }
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
                this.timeSegDistributionIndexes.length = 0;
                this.distribution = false;
                timeSegIndex++;
            });

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
}
