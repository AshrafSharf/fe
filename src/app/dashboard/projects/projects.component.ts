import { Router, ActivatedRoute } from '@angular/router';
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
    
    title: String = '';
    description: String = '';
    ownerId: String = 'owner1';
    ownerName: String = 'owner1';

    selectedProject: Project = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:Modal, 
        private projectService: ProjectService) {
    }

    ngOnInit(): void {
        this.route
            .queryParams
            .subscribe(params => {
                var id = params["id"];
                if (id == undefined) return;
                
                this.projectService
                    .getDetails(id)
                    .subscribe(result => {
                        this.selectedProject = result.data as Project;
                        this.title = this.selectedProject.title;
                        this.description = this.selectedProject.description;
                        this.ownerId = this.selectedProject.ownerId;
                        this.ownerName = this.selectedProject.ownerName;
                    });
            });
    }

    // create project
    onSave() {
        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter project name')
                .open();
        } else if (this.ownerId.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please select project owner')
                .open();
        } else {
            if (this.selectedProject != null) {
                // update existing
                this.projectService
                    .updateProject(this.selectedProject.id, this.title, this.description)
                    .subscribe(result => {
                        console.log(result);
                        this.clearInputs();
                    });
            } else {
                // create new 
                this.projectService
                    .createProject(this.title, this.description, this.ownerId)
                    .subscribe(result => {
                        this.clearInputs();
                    });
            }
        }
    }

    // clear inputs
    clearInputs() {
        this.title = '';
        this.description = '';
        this.ownerId = '';
        this.ownerName = '';
        this.selectedProject = null;
        
        this.router.navigate(['project-list']);
    }

}