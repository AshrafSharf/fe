import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../shared/interfaces/project';
import { ProjectService } from '../../services/project.service';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/roles.service';
import { Branch } from '../../shared/interfaces/branch';
import { Utils } from '../../shared/utils';

@Component({
    selector: 'branch-list',
    templateUrl: './branches-list.component.html',
    styleUrls: ['./branches-list.component.css']
})

export class BranchListComponent implements OnInit {
    //@ViewChild('projectList') selectedProject:ElementRef;
    selectedProject = '';
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    projects: Project[] = new Array<Project>();
    branches:Branch[] = Array<Branch>();
    currentProject: Project;
    
    isLoading: Boolean = false;
    userRole:String;
    private selectedProjectId = null;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private branchService:BranchService,
        private modal:Modal, 
        private projectService: ProjectService,
        private roleService: RoleService,
        private userService: UserService) {
            
        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Branch Name", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("owner", "Owner", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("description", "Description", "col-md-5", "", ""));
        this.columns.push(new TableViewHeader("private", "Private", "col-md-1", "", ""));
    }

    ngOnInit() {
        let roles = [];
        this.roleService.getRoles().subscribe(result => {
            let roleData = result.data;
            roleData.forEach(role => {
                roles.push(role);
            });

            this.userService.getLoggedInUser().subscribe(result => {
                if (result.status == "OK") {
                    let userData = result.data;
                    roles.forEach(user => {
                        if (userData.roleId == user.id) {
                            this.userRole = user.roleName;
                        }
                    });

                }
            });
        });

        this.route.queryParams.subscribe(params => {
           // this.selectedProjectId = params['projectId'];

            if (this.selectedProjectId == undefined) {
                   if (Utils.getLastSelectedProject()!="null"){
                    this.selectedProjectId = Utils.getLastSelectedProject();
                   }
            }
        });
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
                    this.projects = result.data;
                    if (this.selectedProjectId != null) {
                        this.selectedProject = this.selectedProjectId;
                        console.log("projectId: " + this.selectedProjectId);
                    } else {
                        if (this.projects.length > 0) {
                            this.selectedProject = this.projects[0].id.toString();
                        }
                    }

                    this.reloadBranches();
                }
            });
    }

    addNewBranch() {
        for (var index = 0; index < this.projects.length; index++) {
            if (this.projects[index].id == this.selectedProject) {
                this.router.navigate(['/home/create-branch'], { queryParams: {
                    projectId: this.selectedProject,
                    title: this.projects[index].title
                }});
                break;
            }            
        }
    }

    reloadBranches(projectId:String = null) {
        var id = projectId;
        if (projectId == null){ 
            if (this.selectedProjectId != null) {
                id = this.selectedProjectId;
            } else if (this.projects.length > 0) {
                id = this.projects[0].id;
            }
        }

        Utils.selectProject(id);

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
                        if (branch.isMaster == true){
                             row.addColumn(new TableViewColumn("name", branch.title + " (master)"));
                             row.setPrivate(this.projects[0].isPrivate);
                             row.setUsersWithAccess(this.projects[0].usersWithAccess);
                             row.addColumn(new TableViewColumn("owner", branch.ownerName));
                             row.addColumn(new TableViewColumn("description", branch.description));
                             row.addColumn(new TableViewColumn("private", this.projects[0].isPrivate.toString()));

                        } else {
                             row.addColumn(new TableViewColumn("name", branch.title));
                             row.setPrivate(branch.isPrivate);
                             row.setUsersWithAccess(branch.usersWithAccess);
                             row.addColumn(new TableViewColumn("owner", branch.ownerName));
                             row.addColumn(new TableViewColumn("description", branch.description));
                             row.addColumn(new TableViewColumn("private", branch.isPrivate.toString()));
                           }

                        this.rows.push(row);
                    });
                });
        }
    }

    onRowEdit(id) {
        for (var index = 0; index < this.branches.length; index++) {
            var branch = this.branches[index];
            console.log(branch);
            if (branch.id == id) {
                this.router.navigate(['home/create-branch'], { queryParams: {
                    id: branch.id,
                    projectId: this.selectedProject
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