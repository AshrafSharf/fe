import { AppVariableService } from './../../services/variable.services';
import { Component, OnInit } from '@angular/core';
import { Project } from '../../shared/interfaces/project';
import { Branch } from '../../shared/interfaces/branch';
import { ProjectService } from '../../services/project.service';
import { BranchService } from '../../services/branch.service';
import { Router } from '@angular/router';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Variable } from '../../shared/interfaces/variables';

@Component({
    selector: 'variable-list',
    templateUrl: './variable-list.component.html'
})

export class VariableListComponent implements OnInit {
    projects:Project[] = Array<Project>();
    branches:Branch[] = Array<Branch>();
    variables: Variable[] = Array<Variable>();

    columns: Array<TableViewHeader>;
    rows: TableViewRow[] = new Array<TableViewRow>();
    
    selectedProject: String = '';
    selectedBranch: String = '';

    constructor(
        private variableService: AppVariableService,
        private modal: ModalDialogService,
        private router: Router,
        private projectService:ProjectService,
        private branchService:BranchService) { }

    ngOnInit() {
        this.reloadProjects();

        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("owner", "Owner", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("varType", "Variable Type", "col-md-2", "", ""));
        this.columns.push(new TableViewHeader("valueType", "Value Type", "col-md-2", "", ""));
        this.columns.push(new TableViewHeader("timesegment", "#Segments", "col-md-1", "", ""));
    }

    addNewVariable() {
        if (this.selectedProject.length == 0) {
            this.modal.showError('Please select a project');
        } else if (this.selectedBranch.length == 0) {
            this.modal.showError('Please select a branch');            
        } else {
            this.router.navigate(['/home/create-variable'], {
                queryParams: {
                    projectId: this.selectedProject,
                    branchId: this.selectedBranch
                }
            });
        }
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    reloadVariables() {
        this.variableService
            .getVariables(this.selectedBranch)
            .subscribe(response => {
                console.log(response);
                this.variables = response.data as Array<Variable>;

                this.rows = new Array<TableViewRow>();
                this.variables.forEach(variable => {
                    var row = new TableViewRow(variable.id);
                    row.addColumn(new TableViewColumn("name", variable.title));
                    row.addColumn(new TableViewColumn("owner", variable.ownerName));
                    row.addColumn(new TableViewColumn("varType", variable.variableType));
                    row.addColumn(new TableViewColumn("valueType", variable.valueType));
                    row.addColumn(new TableViewColumn("timesegment", variable.timeSegment.length.toString()));
                    this.rows.push(row);
                });
            })
    }

    reloadProjects() {
        // clear rows
        this.rows.splice(0, this.rows.length);

        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    this.projects = result.data;
                    this.selectedProject = '';
                    if (this.projects.length > 0) {
                        this.selectedProject = this.projects[0].id;
                    }
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId:String = null) {
        // clear rows
        this.rows.splice(0, this.rows.length);

        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedBranch = '';
                    if (this.branches.length > 0) {
                        this.selectedBranch = this.branches[0].id;
                        this.reloadVariables();
                    }
                });
        }
    }

    onRowEdit(event) {
        console.log(event);
    }

    onRowDelete(event) {
        console.log(event);
    }
}