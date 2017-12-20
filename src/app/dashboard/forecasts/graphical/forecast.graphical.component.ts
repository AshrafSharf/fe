import { Component, OnInit } from '@angular/core';
import { Project } from '../../../shared/interfaces/project';
import { Branch } from '../../../shared/interfaces/branch';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch.service';
import { ProjectService } from '../../../services/project.service';
import { AppVariableService } from '../../../services/variable.services';
import { Variable } from '../../../shared/interfaces/variables';

@Component({
    selector: 'forecast-graphical',
    templateUrl: './forecast.graphical.component.html'
})

export class ForecastGraphicalComponent implements OnInit {
    projects: Project[] = new Array<Project>();
    branches:Branch[] = new Array<Branch>();
    variables:Variable[] = new Array<Variable>();

    lineChartColors:Array<any> = [];
    lineChartData:Array<any> = [];
    lineChartLabels:Array<any> = [];
    lineChartOptions:any = {
        responsive: true
    };

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
                    }
                });
        }
    }

    renderChart(branchId) {
        var branch:Branch = null;
        for (var index = 0; index < this.branches.length; index++) {
            if (this.branches[index].id == branchId) {
                branch = this.branches[index];
                break;
            }
        }

        if (branch != null) {

        }
    }

}