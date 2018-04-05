import {Component, OnInit} from '@angular/core'
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { Project } from '../../shared/interfaces/project';
import { Branch } from '../../shared/interfaces/branch';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/roles.service';
import { UserService } from '../../services/user.service';
import { Simulation } from '../../shared/interfaces/simulation';
import { ProjectService } from '../../services/project.service';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Utils } from '../../shared/utils';
import { SimulationService } from '../../services/simulation.service';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: 'simulation-list',
    templateUrl: './simulation-list.component.html',
    styleUrls: ['./simulation-list.component.css']
})
export class SimulationListComponent implements OnInit {
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    projects: Project[] = new Array<Project>();
    simulations: Simulation[] = new Array<Simulation>();

    isLoading: Boolean = false;
    userRole:String;
    private selectedProjectId = null;
    selectedProject = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:Modal, 
        private roleService:RoleService,
        private userService:UserService,
        private projectService:ProjectService,
        private simulationService:SimulationService
        ){
            this.columns = new Array<TableViewHeader>();
            this.columns.push(new TableViewHeader("name", "Simulation Name", "col-md-3", "", ""));
            this.columns.push(new TableViewHeader("owner", "Owner", "col-md-3", "", ""));
            this.columns.push(new TableViewHeader("description", "Description", "col-md-5", "", ""));
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
                this.reloadSimulations(this.selectedProject);
                   
                }
            });
    }

    selectSimulations(event){
        this.reloadSimulations(event.target.value);
    }

    reloadSimulations(projectId:String = null) {
        var id = projectId;
        if (projectId == null){ 
            if (this.selectedProjectId != null) {
                id = this.selectedProjectId;
            } else if (this.projects.length > 0) {
                id = this.projects[0].id;
            }
        }

        //Utils.selectProject(id);

        console.log(id);
        if (id != null) {
            this.simulationService
                .getSimulationsByProject(id)
                .subscribe(result => {
                    this.simulations = result.data as Array<Simulation>;
                    console.log(this.simulations);

                    this.rows = new Array<TableViewRow>();
                    this.simulations.forEach(sim => {
                        var row = new TableViewRow(sim.id);
                       row.addColumn(new TableViewColumn("name", sim.title));
                        row.addColumn(new TableViewColumn("owner", sim.ownerName));
                        row.addColumn(new TableViewColumn("description", sim.description));
                        this.rows.push(row);
                    });
                });
        }
    }

    onAddNewSimulation() {
        for (var index = 0; index < this.projects.length; index++) {
            if (this.projects[index].id == this.selectedProject) {
                this.router.navigate(['/home/create-simulation'], { queryParams: {
                    projectId: this.selectedProject,
                    title: this.projects[index].title
                }});
                break;
            }            
        }             
    }

    onRowEdit(id) {
        for (var index = 0; index < this.simulations.length; index++) {
            var sim = this.simulations[index];
            console.log(sim);
            if (sim.id == id) {
                this.router.navigate(['home/create-simulation'], { queryParams: {
                    id: sim.id,
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
                .body('Are you sure you want to delete this Simulation?')
                .okBtn('Yes').okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.isLoading = true;
                this.simulationService
                    .deleteSimulation(id)
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