import { Project } from './../../shared/interfaces/project';
import { TimeSegmentComponent } from './../variables/time-segment/time.segment.component';
import { Component, OnInit } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit { 
    
    title:String = "";
    description = "";

    selectedProject = null;
    isLoading:Boolean = false;
    projects:Project[] = new Array<Project>();

    constructor(public modal:Modal, private projectService: ProjectService) {
    }

    ngOnInit(): void {
        this.reloadProjects();
    }

    // create project
    onSave() {
        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter project name')
                .open();
        } else {
            if (this.selectedProject != null) {
                // update existing
                this.projectService
                    .updateProject(this.selectedProject.id, this.selectedProject.title, this.selectedProject.description)
                    .subscribe(result => {
                        this.clearInputs();
                        this.reloadProjects();
                    });
            } else {
                // create new 
                this.projectService
                    .createProject(this.title, this.description)
                    .subscribe(result => {
                        this.clearInputs();
                        this.reloadProjects();
                    });
            }
        }
    }

    // select project to update info
    onProjectSelected(event) {
        for (var index = 0; index < this.projects.length; index++) {
            if (this.projects[index].id == event.id) {
                this.selectedProject = this.projects[index];
                this.title = this.selectedProject.title;
                this.description = this.selectedProject.description;
                break;
            }
        }
    }

    // clear inputs
    clearInputs() {
        this.title = "";
        this.description = "";
        this.selectedProject = null;
    }

    // reload projects
    reloadProjects() {
        this.isLoading = true;
        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status = 'OK') {
                    this.projects = result.data;                    
                }
                this.isLoading = false;
            });
    }

    onDelete(event) {
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
                    .deleteProject(event.id)
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