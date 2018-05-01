import { Component, OnInit } from '@angular/core';
import { Project } from '../../shared/interfaces/project';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/roles.service';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Router } from '@angular/router';

@Component({
    selector: 'project-list',
    templateUrl: './project.list.component.html',
    styleUrls: ['./project.list.component.css']
})

export class ProjectListComponent implements OnInit {
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    projects: Project[] = new Array<Project>();

    isLoading: Boolean = false;
    userRole:String;
    
    constructor(
        private router: Router,
        private modal:Modal,
        private roleService: RoleService,
        private userService: UserService,
        private projectService: ProjectService) {
            
        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Project Name", "col-md-3", "", ""));
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

        this.reloadProjects();
    }

    onRowEdit(id) {
        for (var index = 0; index < this.projects.length; index++) {
            var project = this.projects[index];
            if (project.id == id) {
                this.router.navigate(['home/create-project'], { queryParams: {
                    id: project.id
                }});
                break;
            }
        }
    }

    addNewProject() {
        this.router.navigate(['home/create-project']);
    }

    onRowDelete(id) {
        const dialog =
            this.modal
                .confirm()
                .title('Confirmation')
                .body('Are you sure you want to delete this project?')
                .okBtn('Yes').okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();

        dialog.then(promise => {
            promise.result.then(result => {
                this.isLoading = true;
                this.projectService
                    .deleteProject(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {
                            this.reloadProjects();
                        }                     
                        this.isLoading = false;
                    });
            });
        });
    }
    

    // reload projects
    reloadProjects() {
        this.isLoading = true;
        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status = 'OK') {
                    this.projects = result.data as Array<Project>;
                    this.rows = new Array<TableViewRow>();
                    this.projects.forEach(project => {
                        var row = new TableViewRow(project.id);
                        row.setPrivate(project.isPrivate);
                        row.addColumn(new TableViewColumn("name", project.title));
                        row.addColumn(new TableViewColumn("owner", project.ownerName));
                        row.addColumn(new TableViewColumn("description", project.description));
                        row.addColumn(new TableViewColumn("private", project.isPrivate.toString()));

                        this.rows.push(row);
                                //adding for defining private projects      
//               if (project.isPrivate) {                           
//               if (!this.privateProject) {
//            this.privateProject = true;
//            this.users.forEach(user => {
//            if(user.id == Utils.getUserId()) {
//                this.usersWithAccess.push(user);
//                      }
//                   });
//                }
//    }
                    });
                }
                this.isLoading = false;
            });
    }
}