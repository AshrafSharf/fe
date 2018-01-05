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

            variableTimeSegments.forEach(timeSeg => {

                for (var index = 0; index < timeSeg.length; index++) {
                    var startDate = new Date((timeSeg[index].startTime[3] + timeSeg[index].startTime[4] + "/" + timeSeg[index].startTime[0] + timeSeg[index].startTime[1] + "/" + timeSeg[index].startTime[6]+timeSeg[index].startTime[7]+timeSeg[index].startTime[8]+timeSeg[index].startTime[9]).toString());

                    if (timeSeg[index].endTime == null) {
                        var endDate = new Date(null);
                    }
                    else {
                        var endDate = new Date((timeSeg[index].endTime[3] + timeSeg[index].endTime[4] + "/" + timeSeg[index].endTime[0] + timeSeg[index].endTime[1] + "/" + timeSeg[index].endTime[6]+timeSeg[index].endTime[7]+timeSeg[index].endTime[8]+timeSeg[index].endTime[9]).toString());

                    }
                    //console.log(timeSeg[index].startTime);
                    //console.log(startDate);

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

            console.log("Earliest start time: "+this.earliestStart);
            console.log("Latest end time: "+this.latestEnd);


            //var newStartTime = this.startTime.split("-");
            //var newEndTime = this.endTime.split("-");

            //var newDate = (startDate[1] + "/" + startDate[0] + "/" + startDate[2]).toString();
            //console.log(newDate);

            //var startDate = new Date((newStartTime[1] + "/" + newStartTime[0] + "/" + newStartTime[2]).toString());
            //var endDate = new Date((newStartTime[1] + "/" + newStartTime[0] + "/" + newStartTime[2]).toString());

            //var actualsStartDate = new Date((newStartTime[1] + "/" + newStartTime[0] + "/" + newStartTime[2]).toString());
            //var endDate = new Date((newEndTime[1]+"/"+newEndTime[0]+"/"+newEndTime[2]).toString());



            var startDate = new Date();

            var endDate = new Date();
            endDate.setMonth(startDate.getMonth() + 12);

            var actualsStartDate = new Date();
            actualsStartDate.setMonth(startDate.getMonth() - 6);

            var monthDifference = this.getMonthDifference(this.earliestStart, this.latestEnd);
            console.log("monthDifference: "+monthDifference);
            //var monthDifference = 12;

            //var maxYearsBetween = (endDate.getFullYear()) - (startDate.getFullYear());

            var startMonthIndex = this.earliestStart.getMonth();

            var endMonthIndex = this.latestEnd.getMonth();

            //var actualsMonthIndex = actualsStartDate.getMonth();

            //var monthCounter = monthDifference;

            var noOfColumns = 0;

            //var addedYears = addedMonths/12;

            this.columns = new Array<TableViewHeader>();
            this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));


/*
            var startDate = new Date();

            var endDate = new Date();
            endDate.setMonth(startDate.getMonth() + 12);

            var actualsStartDate = new Date();
            actualsStartDate.setMonth(startDate.getMonth() - 6);

            //var monthDifference = this.getMonthDifference(startDate, endDate);
            var monthDifference = 12;

            var maxYearsBetween = (endDate.getFullYear()) - (startDate.getFullYear());

            var startMonthIndex = startDate.getMonth();

            var endMonthIndex = endDate.getMonth();

            var actualsMonthIndex = actualsStartDate.getMonth();

            //var monthCounter = monthDifference;


            //var addedYears = addedMonths/12;

            this.columns = new Array<TableViewHeader>();
            this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));

            // Assigning each table column header it's appropriate month
            // Actual months
            if (actualsMonthIndex > 5) {

                for (var index = actualsMonthIndex; index < 12; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + actualsStartDate.getFullYear(), "col-md-3", "", ""));
                    noOfColumns++;
                }
                for (var index = 0; index < startMonthIndex; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + startDate.getFullYear(), "col-md-3", "", ""));
                    noOfColumns++;
                }
            }
            else {
                for (var index = actualsMonthIndex; index < startMonthIndex; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + actualsStartDate.getFullYear(), "col-md-3", "", ""));
                    noOfColumns++;
                }
            }
*/

            var noOfColumns = 0;


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

                //for (var index = startMonthIndex; index < monthDifference; index++) {
                  //  this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + this.earliestStart.getFullYear(), "col-md-3", "", ""));
                    //monthDifference--;
                    //noOfColumns++;
                //}
            }



/*
-------------------------------------------------------------

            // Forecast months
            if (startMonthIndex > 0) {
                // If startMonthIndex > 0, finish the year
                for (var index = startMonthIndex; index < 12; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + this.earliestStart.getFullYear(), "col-md-3", "", ""));
                    monthDifference--;
                    noOfColumns++;
                }


                --------------------------
                 // If there are more than 12 month left between startMonthIndex and endMonthIndex add appropriate months
                 if (monthCounter > 12) {
                 for (var index1 = 0; index1 < addedYears; index1++) {
                 for (var index2 = 0; index2 < 12; index2++) {
                 this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index2] + " " + (startDate.getFullYear()+(index1 + 1)), "col-md-3", "", ""));
                 monthCounter--;
                 noOfColumns++;
                 }
                 }
                 }
                 -------------------------------


                // Finish the time frame
                for (var index = 0; index < monthDifference; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + this.latestEnd.getFullYear(), "col-md-3", "", ""));
                    //monthDifference--;
                    noOfColumns++;
                }
            }

            else {
                // Finish the time frame
                for (var index = 0; index < 12; index++) {
                    this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + this.earliestStart.getFullYear(), "col-md-3", "", ""));
                    //monthCounter--;
                    noOfColumns++;
                }

                ----------------------------------
                 if (monthCounter > 12) {
                 for (var index1 = 0; index1 < addedYears; index1++) {
                 for (var index2 = 0; index2< 12; index2++) {
                 this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index2] + " " + (startDate.getFullYear()+(index1 + 1)), "col-md-3", "", ""));
                 monthCounter--;
                 noOfColumns++;
                 }
                 }
                 }

                 for (var index = 0; index <= endMonthIndex; index++) {
                 this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + endDate.getFullYear(), "col-md-3", "", ""));
                 monthCounter--;
                 noOfColumns++;
                 }



                 else {
                 for (var index = startMonthIndex; index <= endMonthIndex; index++) {
                 this.columns.push(new TableViewHeader("Column " + noOfColumns, this.months[index] + " " + startDate.getFullYear(), "col-md-3", "", ""));
                 monthCounter--;
                 noOfColumns++;
                 }
                 }
                 --------------------------------
            }

----------------------------------------------------------
    */

            var timeSegIndex = 0;
            var varTitle;

            var timeSegStart;

            var timeSegStartMonth;
            var timeSegStartYear;
            var timeSegStartDate;




            var value = 0;

            // Add data to rows
            this.rows = new Array<TableViewRow>();
            this.variables.forEach(variable => {

                varTitle = variable.title;
                this.started = false;

                for (var index = 0; index < variableTimeSegments[timeSegIndex].length; index++) {



                    var row = new TableViewRow(variable.id);
                    row.addColumn(new TableViewColumn("name", variable.title));

                    //console.log("variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data length: "+(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length);

                    // If a variable is of type 'actual' add data to appropriate columns
                    //if (variable.variableType == "actual") {
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


                                    for (var x = 1; x < this.columns.length; x ++) {

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
                                                    column++;
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
                                                    column++;
                                                }
                                                break;
                                            }
                                            else {
                                                row.addColumn(new TableViewColumn("Column " + x, "-X-"));
                                                column++;
                                                //console.log("Its Not");
                                                //row.addColumn(new TableViewColumn("Column " + index1, "Its Not"));
                                            }
                                        }

                                    }


                                    // If a variable's resultMap contains more than 1 instance then set the this.distribution boolean to true and add the index of the time segment to the this.timeSegDistributionIndexes array
                                    if ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length > 1) {
                                        this.distribution = true;
                                        this.timeSegDistributionIndexes.push(index);
                                    }

/*
                                    // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                                    if ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length > 1) {
                                        for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                            row = new TableViewRow(variable.id + "." + (index1 + 1));
                                            row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].title));

                                            column = 0;
                                            for (var index2 = 0; index2 < 18; index2++) {
                                                if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + column, " "));
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                    row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                                }
                                                column++;
                                            }
                                            this.rows.push(row);
                                        }
                                    }
                                    //this.rows.push(row);
*/
                                }
                                else {
                                    for (var column = 0; column < this.columns.length; column++) {
                                        row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                    }
                                    //this.rows.push(row);
                                }
                            }


                            this.rows.push(row);
                            this.started = false;

                            if (this.distribution == true) {

                                this.timeSegDistributionIndexes.forEach(dist => {
                                    for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                        row = new TableViewRow(variable.id + "." + (index1 + 1));
                                        row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title));

                                        column = 0;
                                        //console.log(varTitle + " " + variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].title);
                                        for (var index2 = 0; index2 < 18; index2++) {
                                            if (variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                row.addColumn(new TableViewColumn("Column " + column, " "));
                                            }
                                            else {
                                                value = parseFloat(variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                //console.log(variableTimeSegments[timeSegIndex][dist].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                            }
                                            column++;
                                        }
                                        this.rows.push(row);
                                    }
                                });



                                /*
                                for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                    row = new TableViewRow(variable.id + "." + (index1 + 1));
                                    row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].title));

                                    column = 0;
                                    for (var index2 = 0; index2 < 18; index2++) {
                                        if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                            row.addColumn(new TableViewColumn("Column " + column, " "));
                                        }
                                        else {
                                            value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                            row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                        }
                                        column++;
                                    }
                                    this.rows.push(row);
                                }
                                */
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
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                                    row.addColumn(new TableViewColumn("Column " + index1, ((Math.round(value * 100)) / 100).toString()));
                                                }
                                                column++;
                                            }
                                            this.rows.push(row);
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
                                                column++;
                                            }
                                            this.rows.push(row);
                                            break;
                                        }
                                        else {
                                            row.addColumn(new TableViewColumn("Column " + x, "-X-"));
                                            column++;
                                            //console.log("Its Not");
                                            //row.addColumn(new TableViewColumn("Column " + index1, "Its Not"));
                                        }
                                    }

                                }

                                // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                                if ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length > 1) {
                                    for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                        row = new TableViewRow(variable.id + "." + (index1 + 1));
                                        row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].title));

                                        column = 0;
                                        for (var index2 = 0; index2 < 18; index2++) {
                                            if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                row.addColumn(new TableViewColumn("Column " + column, " "));
                                            }
                                            else {
                                                value = parseFloat(variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                            }
                                            column++;
                                        }
                                        this.rows.push(row);
                                    }
                                }
                            }
                            else {
                                for (var column = 0; column < 18; column++) {
                                    row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                }
                                this.rows.push(row);
                            }
                        }
/*
                    }
                    // If variable is of type 'forecast' add empty data cells for the first 6 months of time period
                    else if (variable.variableType == "forecast") {
                        // If a variable has more than 1 time segment
                        if (variableTimeSegments[timeSegIndex].length > 1) {

                            for (var index = 0; index < variableTimeSegments[timeSegIndex].length; index++) {
                                if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse != null) {

                                    for (var index1 = 0; index1 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index1++) {
                                        if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                            row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                        }
                                        else {
                                            value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index1].value);
                                            row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                        }
                                        column++;
                                    }


                                    // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                                    if ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length > 1) {
                                        for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                            row = new TableViewRow(variable.id + "." + (index1 + 1));
                                            row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].title));

                                            for (var column = 0; column < 6; column++) {
                                                row.addColumn(new TableViewColumn("Column " + column, "-"));
                                            }

                                            column = 6;
                                            for (var index2 = 0; index2 < (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data).length; index2++) {
                                                if (variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                    row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                                }
                                                else {
                                                    value = parseFloat(variableTimeSegments[timeSegIndex][index].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                    row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                                }
                                                column++;
                                            }
                                            this.rows.push(row);
                                        }
                                    }
                                }
                                else {
                                    for (var column = 0; column < 18; column++) {
                                        row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                    }

                                }
                            }
                            this.rows.push(row);
                        }
                        else {
                            if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse != null) {
                                for (var column = 0; column < 6; column++) {
                                    row.addColumn(new TableViewColumn("Column " + column, "-"));
                                }

                                var column = 6;
                                for (var index1 = 0; index1 < 12; index1++) {
                                    if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data[index1] == null) {
                                        row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                    }
                                    else {
                                        value = parseFloat(variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data[index1].value);
                                        row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                    }
                                    column++;
                                }
                                this.rows.push(row);

                                // If a variable's resultMap contains more than 1 instance then add the appropriate data to the associated columns
                                if ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length > 1) {
                                    for (var index1 = 0; index1 < ((variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap).length) - 1; index1++) {
                                        row = new TableViewRow(variable.id + "." + (index1 + 1));
                                        row.addColumn(new TableViewColumn("name", varTitle + " " + variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].title));

                                        for (var column = 0; column < 6; column++) {
                                            row.addColumn(new TableViewColumn("Column " + column, "-"));
                                        }

                                        column = 6;
                                        for (var index2 = 0; index2 < 12; index2++) {
                                            if (variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[0].data[index2] == null) {
                                                row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                            }
                                            else {
                                                value = parseFloat(variableTimeSegments[timeSegIndex][0].timeSegmentResponse.resultMap[index1 + 1].data[index2].value);
                                                row.addColumn(new TableViewColumn("Column " + column, ((Math.round(value*100))/100).toString()));
                                            }
                                            column++;
                                        }
                                        this.rows.push(row);
                                    }
                                }
                            }
                            else {
                                for (var column = 0; column < 18; column++) {
                                    row.addColumn(new TableViewColumn("Column " + column, "n/a"));
                                }
                                this.rows.push(row);
                            }
                        }


                    }
                    */
                    //timeSegCounter++;
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