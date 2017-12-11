import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../shared/interfaces/project';
import { ProjectService } from '../../services/project.service';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Router } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../shared/interfaces/branch';

@Component({
    selector: 'branch-list',
    templateUrl: './branches-list.component.html',
    styleUrls: ['./branches-list.component.css']
})

export class BranchListComponent implements OnInit {
    @ViewChild('projectList') selectedProject:ElementRef;
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    projects: Project[] = new Array<Project>();
    branches:Branch[] = Array<Branch>();
    
    isLoading: Boolean = false;
    
    constructor(
        private router: Router,
        private branchService:BranchService,
        private modal:Modal, 
        private projectService: ProjectService) {
            
        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Branch Name", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("owner", "Owner", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("description", "Description", "col-md-5", "", ""));
    }

    ngOnInit() {
        this.reloadProjects();
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
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

    addNewBranch() {
        var projectId = this.selectedProject.nativeElement.value;
        for (var index = 0; index < this.projects.length; index++) {
            if (this.projects[index].id == projectId) {
                this.router.navigate(['/home/create-branch'], { queryParams: {
                    projectId: projectId,
                    title: this.projects[index].title
                }});
                break;
            }            
        }
    }

    reloadBranches(projectId:String = null) {

        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        console.log(id);
        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data as Array<Branch>;
                    console.log(this.branches);

                    this.rows = new Array<TableViewRow>();
                    this.branches.forEach(branch => {
                        var row = new TableViewRow(branch.id);
                        row.addColumn(new TableViewColumn("name", branch.title));
                        row.addColumn(new TableViewColumn("owner", branch.ownerName));
                        row.addColumn(new TableViewColumn("description", branch.description));
                        this.rows.push(row);
                    });
                });
        }
    }

    onRowEdit(id) {
        var projectId = this.selectedProject.nativeElement.value;
        
        for (var index = 0; index < this.projects.length; index++) {
            var branch = this.branches[index];
            if (branch.id == id) {
                this.router.navigate(['home/create-branch'], { queryParams: {
                    id: branch.id,
                    projectId: projectId
                }});
                break;
            }
        }
    }

    onRowDelete(id) {
        const dialog =
            this.modal
                .confirm()
                .title('Confirmation')
                .body('Are you sure you want to delete this branch?')
                .okBtn('Yes').okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.isLoading = true;
                this.branchService
                    .deleteBranch(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {
                            this.reloadProjects();
                        }
                  
                        this.isLoading = false;
                    });
            });
        });
    }
}