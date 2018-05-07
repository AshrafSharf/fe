import { Project } from './../../shared/interfaces/project';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Branch } from './../../shared/interfaces/branch';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { BranchService } from '../../services/branch.service';
import { Moment } from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../shared/interfaces/user';
import { UserService } from '../../services/user.service';
import { Utils } from '../../shared/utils';
import { Config } from '../../shared/config';

@Component({
    selector: 'branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit {
  
    isPrivate: Boolean = false;
    PrivateBranch: Boolean = false;
    usersWithAccess: User[] = Array<User>();
 
    isLoading:Boolean = false;

    users: User[] = Array<User>();
    ownerId: String = '';
    selectedProjectId: String = '';
    selectedProjectTitle: String = '';

    // time, hour, month
    startDate: String;
    endDate: String;
    actualsDate: String;

    // week
    startWeek: String = '';
    endWeek: String = '';
    actualsWeek: String = '';

    //dd-MM-yyyy hh:mm
    datePickerConfig = { format : Config.getDateFormat() };

    selectedProject:Project = null;

    selectedBranch:Branch = null;
    createdBranch:Branch = null;

    datePickerMode: String = 'month';

    projectTitle: String = "";
    title: String = "";
    description: String = "";
    timeUnit: String = 'Month';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private branchService:BranchService,
        private projectService:ProjectService,
        public modal:Modal) {

    }

    ngOnInit() {
        // get the project and branch Id from route params
        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'];
            this.selectedProjectTitle = params['title'];
            var branchId = params['id'];
            if (branchId == undefined) return;

            this.projectService
                .getDetails(this.selectedProjectId)
                .subscribe(result => {
                    this.selectedProject = result.data as Project;

                    this.projectTitle = this.selectedProject.title;
                });

            this.branchService
                .getDetails(branchId)
                .subscribe(result => {
                    this.selectedBranch = result.data as Branch;

                    this.title = this.selectedBranch.title;
                    this.description = this.selectedBranch.description;
                    this.ownerId = this.selectedBranch.ownerId;
                    this.startDate = this.selectedBranch.startTime;
                    this.endDate = this.selectedBranch.endTime;
                    this.actualsDate = this.selectedBranch.actuals;
                    this.isPrivate = this.selectedBranch.isPrivate;
                    this.usersWithAccess = this.selectedBranch.usersWithAccess;
                });
        });

        // get all the users
        this.userService
            .getOwners((users => {
                this.users = users;
                if (this.ownerId == "") {
                    this.ownerId = Utils.getUserId();
                }
            }));
    }

    // change time unit
    onChangeTimeUnit() {
        if (this.timeUnit == 'Month') {
            this.datePickerMode = 'month';
        } else if (this.timeUnit == 'Hour' || this.timeUnit == 'Time') {
            this.datePickerMode = 'time';
        }
    }

    // clear inputs
    clearInputs() {
        this.title = "";
        this.description = "";
        this.selectedBranch = null;

        this.startDate = '';
        this.endDate = '';
        this.actualsDate = '';
        this.startWeek = '';
        this.endWeek = '';
        this.actualsWeek = '';
        this.datePickerMode = 'month';
        this.timeUnit = 'month';

         if (this.createdBranch != null){
             Utils.selectProject(this.createdBranch.projectId);
             Utils.selectBranch(this.createdBranch.projectId, this.createdBranch.id);
            this.router.navigate(['/home/variable-list'], { queryParams: {
                projectId: this.createdBranch.projectId,
                branchId: this.createdBranch.id
            }});
        } else{
            this.router.navigate(['/home/branches-list'], { queryParams: {
                projectId: this.selectedProjectId
            }});
        }
    }

    // create branch
    onSave() {
        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter branch name')
                .open();
        }
  	else if (this.title.match(/[^0-9a-zA-Z_-]/)){
              this.modal.alert()
              .title('Warning')
              .body('Names can only include Alphanumerical characters,underscores and hyphens')
              .open();

        } else {
            var start = this.startDate;
            var end = this.endDate;
            var actuals = this.actualsDate;

            if (this.selectedBranch != null) {
                // update existing
                this.branchService
                    .updateBranch(this.title, this.description, this.selectedProjectId,
                        actuals, start, end, this.ownerId, this.timeUnit, this.selectedBranch.id)
                    .subscribe(result => {
                        console.log(result);
                        if (  result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                              .title("Warning")
                              .body("Failed to update branch called \"" + this.title +
                                    "\". This name is already associated with another branch in this project")
                              .open();
                        } else {
                            this.clearInputs();
                        }
                    });
            } else {

                // create new
                this.branchService
                    .createBranch(this.title, this.description, this.selectedProjectId,
                            actuals, start, end, this.ownerId, this.timeUnit)
                    .subscribe(result => {
                          console.log(result);
                          if (  result.status == "UNPROCESSABLE_ENTITY"){
                              this.modal.alert()
                                .title("Warning")
                                .body("Failed to create branch called " + this.title +
                                      "This name is already associated with another branch in this project")
                                .open();
                          } else{
                            this.branchService.getBranchByName(this.selectedProjectId, this.title)
                                .subscribe(result => {
                                    console.log('result', result);
                                    this.createdBranch = result.data as Branch;
                                    this.clearInputs();
                                });
                          }
                    });
            }
        }
    }
}
