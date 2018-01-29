import { Router, ActivatedRoute } from '@angular/router';
import { Project } from './../../shared/interfaces/project';
import { TimeSegmentComponent } from './../variables/time-segment/time.segment.component';
import { Component, OnInit } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ProjectService } from '../../services/project.service';
import { User } from '../../shared/interfaces/user';
import { UserService } from '../../services/user.service';
import { Utils } from '../../shared/utils';

@Component({
    selector: 'projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

    title: String = '';
    description: String = '';
    owner: String = '';
    users: User[] = Array<User>();

    selectedProject: Project = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:Modal,
        private userService: UserService,
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
                        this.owner = this.selectedProject.ownerId;
                    });
            });

        this.userService
            .getOwners((users => {
                this.users = users;
                if (this.users.length > 0) {
                    this.owner = Utils.getUserId();
                }
            }));
    }

    // create project
    onSave() {
        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter project name')
                .open();
        }
        //if the title has special characters
        else if (this.title.match(/[^a-zA-Z_-]/)){
              this.modal.alert()
              .title('Warning')
              .body('Names can only include Alphabetical characters,underscores and hyphens')
              .open();

        }else if (this.owner.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please select project owner')
                .open();
        } else {
            if (this.selectedProject != null) {
                // update existing
                this.projectService
                    .updateProject(this.selectedProject.id, this.title, this.description, this.owner)
                    .subscribe(result => {
                        console.log('result', result);
                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                              .title("Warning")
                              .body("Failed to update project called \"" + this.title +
                                    "\". This name is already associated with another project")
                              .open();
                        } else {
                            this.clearInputs();
                        }
                    });
            } else {
                // create new
                this.projectService
                    .createProject(this.title, this.description, this.owner)
                    .subscribe(result => {
                        console.log('result',result);

                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                              .title("Warning")
                              .body("Failed to create project called \"" + this.title +
                                    "\". This name is already associated with another project")
                              .open();
                        } else {
                          this.clearInputs();
                        }
                    });
            }
        }
    }

    // clear inputs
    clearInputs() {
        this.title = '';
        this.description = '';
        this.owner = '';
        this.selectedProject = null;

        this.router.navigate(['/home/project-list']);
    }

}
