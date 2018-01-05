import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { Branch } from '../../../shared/interfaces/branch';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { ProjectService } from '../../../services/project.service';
import { AppVariableService } from '../../../services/variable.services';
import { Variable } from '../../../shared/interfaces/variables';

import {
    D3Service,
    D3,
    Axis,
    BrushBehavior,
    BrushSelection,
    D3BrushEvent,
    ScaleLinear,
    ScaleOrdinal,
    Selection,
    Transition
} from 'd3-ng2-service';
import { Utils } from '../../../shared/utils';
  

@Component({
    selector: 'forecast-graphical',
    templateUrl: './forecast.graphical.component.html'
})

export class ForecastGraphicalComponent implements OnInit {
    projects: Project[] = new Array<Project>();
    branches:Branch[] = new Array<Branch>();
    variables:Variable[] = new Array<Variable>();
    private exludedVariables: String[] = new Array<String>();

    public lineChartData:Array<any> = [];
    public lineChartLabels:Array<any> = [];
    public lineChartOptions:any = {
        responsive: true
    };

    public lineChartColors:Array<any> = [];
    public lineChartLegend:boolean = true;
    public lineChartType:string = 'line';


    constructor(
        private router: Router,
        private branchService:BranchService,
        private projectService: ProjectService,
        private variableService: AppVariableService) {
    }

    ngOnInit() {
        this.reloadProjects();
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariables(event) {
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
                        this.variables = result.data as Array<Variable>;  
                        console.log("rendering chart");
                        this.clearChart();
                        setTimeout(() => {this.renderChart();}, 100);
                    }
                });
        }
    }

    isLabelAdded(title):Boolean {
        
        let result: Boolean = false;
        for (var index = 0; index < this.lineChartLabels.length; index++) {
            if (this.lineChartLabels[index] == title) {
                result = true;
                break;
            }
        }

        return result;
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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

            for (var timeSegmentIndex = 0; timeSegmentIndex < variable.timeSegment.length; timeSegmentIndex++) {
                let element = variable.timeSegment[timeSegmentIndex];
    
                if (element.timeSegmentResponse != undefined || element.timeSegmentResponse != null) {
    
                    // get all the labels
                    for (var resultMapIndex = 0; resultMapIndex < element.timeSegmentResponse.resultMap.length; resultMapIndex++) {
                        let resultMap = element.timeSegmentResponse.resultMap[resultMapIndex];
    
                        for (var dataIndex = 0; dataIndex < resultMap.data.length; dataIndex++) {
                            let dataPair = resultMap.data[dataIndex];
                            if (!this.isLabelAdded(dataPair.title)) {                            
                                this.lineChartLabels.push(dataPair.title);
                            }
                        }
                    }
    
                    var color = '';
                    var shade = 0.1;

                    // collect all the values
                    for (var resultMapIndex = 0; resultMapIndex < element.timeSegmentResponse.resultMap.length; resultMapIndex++) {
                        let resultMap = element.timeSegmentResponse.resultMap[resultMapIndex];
                        if (resultMapIndex == 0) {
                            color = Utils.getRandomColor();
                            shade = 0;
                        }
    
                        let borderColor = resultMapIndex == 0 ? color : Utils.getShadeOfColor(color, shade)
                        this.lineChartColors.push({ borderColor: borderColor });
                        console.log("borderColor: " + resultMapIndex + ", " + resultMap.title, borderColor);
                        shade += 0.1;
                        var labelTitle = `${variable.title} - Segment: ${timeSegmentIndex + 1} - ${resultMap.title}`;
                        var dataValues = [];
    
                        let labelPosition = 0;
                        let lastValue:Number = 0;
                        
                        for (var dataIndex = 0; dataIndex < resultMap.data.length; dataIndex++) {
                            let dataPair = resultMap.data[dataIndex];
    
                            for (var index = labelPosition; index < this.lineChartLabels.length; index++) {
                                let label = this.lineChartLabels[index];
                                if (label == dataPair.title) {
                                    dataValues.push(dataPair.value.toFixed(2));
                                    labelPosition = index + 1;
                                    if (index == this.lineChartLabels.length - 1) {
    
                                        // add the last value from next timesegment
                                        let tempElement = variable.timeSegment[timeSegmentIndex + 1];
                                        if (tempElement != undefined) {
                                            let resultMapTemp = tempElement.timeSegmentResponse.resultMap[0];
                                            console.log("resultMapTemp", resultMapTemp);
                                            if (resultMapTemp != undefined) {
                                                let entry = resultMapTemp.data[0];
                                                dataValues.push(entry.value.toFixed(2));
                                            }
                                        }
                                    }
                                    break;
                                } else {
                                    dataValues.push(undefined);
                                }
                            }
                        }
    
                        this.lineChartData.push({
                            data: dataValues,
                            label: labelTitle
                        });
                    }
                }
            }
        }
    }

}